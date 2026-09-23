import logging
import os
import secrets
import string
import uuid
from datetime import datetime, timezone

import stripe
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request
from pymongo import ReturnDocument

from catalog import PROMO_CODES
from database import db
from models import CheckoutIn, PromoIn
from security import get_current_user
from services.email import fire_and_forget, order_confirmed_email, send_email

logger = logging.getLogger(__name__)
router = APIRouter(tags=["payments"])

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or "sk_test_emergent"
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

_KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def generate_license_key() -> str:
    groups = ["".join(secrets.choice(_KEY_ALPHABET) for _ in range(4)) for _ in range(4)]
    return "GECKO-" + "-".join(groups)


@router.post("/checkout/validate-promo")
async def validate_promo(body: PromoIn):
    code = body.code.strip().upper()
    percent = PROMO_CODES.get(code)
    if not percent:
        raise HTTPException(status_code=404, detail="Cupom inválido")
    return {"code": code, "percent": percent}


@router.post("/checkout")
async def create_checkout(body: CheckoutIn, user=Depends(get_current_user)):
    seen = set()
    items = []
    for item in body.items:
        key = (item.slug, item.tier)
        if key in seen:
            continue
        seen.add(key)
        product = await db.products.find_one({"slug": item.slug}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=400, detail=f"Produto desconhecido: {item.slug}")
        items.append({"slug": item.slug, "tier": item.tier, "product": product})

    owned = await db.licenses.find(
        {"user_id": user["id"], "status": "active", "product_slug": {"$in": [i["slug"] for i in items]}},
        {"product_slug": 1},
    ).to_list(50)
    if owned:
        names = ", ".join(sorted({o["product_slug"] for o in owned}))
        raise HTTPException(status_code=409, detail=f"Você já possui licença ativa para: {names}")

    promo_code = body.promo_code.strip().upper() if body.promo_code else None
    discount_pct = PROMO_CODES.get(promo_code, 0) if promo_code else 0

    line_items = []
    subtotal = 0
    for item in items:
        lookup_key = f"{item['slug']}_{item['tier']}"
        prices = stripe.Price.list(lookup_keys=[lookup_key], active=True, limit=1).data
        if not prices:
            raise HTTPException(status_code=500, detail=f"Preço não encontrado: {lookup_key}")
        price = prices[0]
        line_items.append({"price": price.id, "quantity": 1})
        unit = item["product"]["prices"][item["tier"]]
        subtotal += unit
        item["name"] = item["product"]["name"]
        item["unit_amount"] = unit

    total = round(subtotal * (100 - discount_pct) / 100)
    order_id = "GL-" + uuid.uuid4().hex[:8].upper()

    session_kwargs = dict(
        line_items=line_items,
        mode="payment",
        success_url=f"{body.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{body.origin_url}/cart",
        metadata={"order_id": order_id, "user_id": user["id"]},
        client_reference_id=order_id,
    )
    if discount_pct:
        session_kwargs["discounts"] = [{"coupon": promo_code}]
    session = stripe.checkout.Session.create(**session_kwargs)

    now = datetime.now(timezone.utc)
    await db.orders.insert_one({
        "order_id": order_id,
        "user_id": user["id"],
        "items": [{"slug": i["slug"], "name": i["name"], "tier": i["tier"], "unit_amount": i["unit_amount"]} for i in items],
        "subtotal_cents": subtotal,
        "discount_pct": discount_pct,
        "promo_code": promo_code if discount_pct else None,
        "total_cents": total,
        "currency": "usd",
        "status": "pending",
        "session_id": session.id,
        "created_at": now,
    })
    await db.payment_transactions.insert_one({
        "session_id": session.id,
        "order_id": order_id,
        "user_id": user["id"],
        "amount": total,
        "currency": "usd",
        "status": "initiated",
        "payment_status": "pending",
        "created_at": now,
        "updated_at": now,
    })
    return {"checkout_url": session.url, "session_id": session.id, "order_id": order_id}


async def fulfill_order(session_id: str) -> None:
    tx = await db.payment_transactions.find_one({"session_id": session_id})
    if not tx or tx.get("payment_status") == "paid":
        return
    guard = await db.payment_transactions.update_one(
        {"session_id": session_id, "payment_status": {"$ne": "paid"}},
        {"$set": {"status": "completed", "payment_status": "paid",
                  "updated_at": datetime.now(timezone.utc)}},
    )
    if guard.modified_count == 0:
        return
    order = await db.orders.find_one_and_update(
        {"order_id": tx["order_id"]},
        {"$set": {"status": "paid", "paid_at": datetime.now(timezone.utc)}},
        return_document=ReturnDocument.AFTER,
    )
    if not order:
        return
    keys = []
    for item in order["items"]:
        existing = await db.licenses.find_one({"order_id": order["order_id"], "product_slug": item["slug"]})
        if existing:
            keys.append(existing["key"])
            continue
        key = generate_license_key()
        await db.licenses.insert_one({
            "key": key,
            "user_id": order["user_id"],
            "order_id": order["order_id"],
            "product_slug": item["slug"],
            "product_name": item["name"],
            "tier": item["tier"],
            "status": "active",
            "activations": 0,
            "max_activations": 50 if item["tier"] == "enterprise" else 3,
            "created_at": datetime.now(timezone.utc),
        })
        keys.append(key)
    user = await db.users.find_one({"_id": ObjectId(order["user_id"])})
    if user:
        order_public = {**order, "_id": None}
        subject, html = order_confirmed_email(user["name"], order_public, keys)
        fire_and_forget(send_email(to=user["email"], subject=subject, html=html))
    logger.info("Order %s fulfilled, %d license(s) issued", order["order_id"], len(keys))


@router.get("/payments/status/{session_id}")
async def payment_status(session_id: str):
    record = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    if record.get("payment_status") != "paid":
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            if session.payment_status == "paid" or session.status == "complete":
                await fulfill_order(session_id)
                record = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        except stripe.error.StripeError:
            pass
    return {
        "session_id": record["session_id"],
        "status": record["status"],
        "payment_status": record["payment_status"],
        "order_id": record.get("order_id"),
    }


@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Assinatura inválida")
    obj, event_type = event["data"]["object"], event["type"]
    now = datetime.now(timezone.utc)
    if event_type == "checkout.session.completed":
        await fulfill_order(obj["id"])
    elif event_type == "checkout.session.async_payment_succeeded":
        await fulfill_order(obj["id"])
    elif event_type == "checkout.session.async_payment_failed":
        await db.payment_transactions.update_one(
            {"session_id": obj["id"]},
            {"$set": {"status": "failed", "payment_status": "failed", "updated_at": now}},
        )
        await db.orders.update_one({"session_id": obj["id"]}, {"$set": {"status": "failed"}})
    elif event_type == "checkout.session.expired":
        await db.payment_transactions.update_one(
            {"session_id": obj["id"]},
            {"$set": {"status": "expired", "payment_status": "expired", "updated_at": now}},
        )
        await db.orders.update_one({"session_id": obj["id"]}, {"$set": {"status": "expired"}})
    elif event_type == "charge.refunded":
        tx = await db.payment_transactions.find_one_and_update(
            {"stripe_payment_intent_id": obj.get("payment_intent")},
            {"$set": {"status": "refunded", "payment_status": "refunded", "updated_at": now}},
        )

        if tx:
            await db.orders.update_one({"order_id": tx["order_id"]}, {"$set": {"status": "refunded"}})
            await db.licenses.update_many({"order_id": tx["order_id"]}, {"$set": {"status": "revoked"}})
    return {"status": "ok"}