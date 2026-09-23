from fastapi import APIRouter, Depends, HTTPException

from database import db
from security import get_current_user

router = APIRouter(tags=["orders"])


def serialize(doc: dict) -> dict:
    doc = {k: v for k, v in doc.items() if k != "_id"}
    for k, v in doc.items():
        if hasattr(v, "isoformat"):
            doc[k] = v.isoformat()
    return doc


@router.get("/orders")
async def list_orders(user=Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [serialize(o) for o in orders]


@router.get("/orders/{order_id}")
async def get_order(order_id: str, user=Depends(get_current_user)):
    order = await db.orders.find_one({"order_id": order_id, "user_id": user["id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    licenses = await db.licenses.find({"order_id": order_id}, {"_id": 0}).to_list(20)
    return {**serialize(order), "licenses": [serialize(lic) for lic in licenses]}
