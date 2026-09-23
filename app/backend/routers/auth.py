import os
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, Response

from database import db
from models import ForgotPasswordIn, LoginIn, RegisterIn, ResetPasswordIn
from security import (
    clear_attempts,
    clear_auth_cookies,
    create_access_token,
    get_current_user,
    hash_password,
    is_locked_out,
    public_user,
    register_failed_attempt,
    set_auth_cookies,
    verify_password,
)
from services.email import fire_and_forget, reset_password_email, send_email, welcome_email

router = APIRouter(tags=["auth"])


@router.post("/auth/register")
async def register(body: RegisterIn, response: Response):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email já cadastrado")
    doc = {
        "name": body.name.strip(),
        "email": email,
        "password_hash": hash_password(body.password),
        "role": "user",
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.users.insert_one(doc)
    user_id = str(result.inserted_id)
    set_auth_cookies(response, user_id, email)
    subject, html = welcome_email(doc["name"])
    fire_and_forget(send_email(to=email, subject=subject, html=html))
    return public_user({**doc, "_id": result.inserted_id})


@router.post("/auth/login")
async def login(body: LoginIn, request: Request, response: Response):
    email = body.email.lower()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    if await is_locked_out(identifier):
        raise HTTPException(status_code=429, detail="Muitas tentativas. Aguarde 15 minutos.")
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        await register_failed_attempt(identifier)
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    await clear_attempts(identifier)
    set_auth_cookies(response, str(user["_id"]), email)
    return public_user(user)


@router.post("/auth/logout")
async def logout(response: Response):
    clear_auth_cookies(response)
    return {"ok": True}


@router.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user


@router.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Sem refresh token")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=["HS256"])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Token inválido")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Refresh token inválido")
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    response.set_cookie(
        key="access_token", value=create_access_token(str(user["_id"]), user["email"]),
        httponly=True, secure=True, samesite="none", max_age=1800, path="/",
    )
    return {"ok": True}


@router.post("/auth/forgot-password")
async def forgot_password(body: ForgotPasswordIn):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if user:
        token = secrets.token_urlsafe(32)
        await db.password_reset_tokens.insert_one({
            "token": token,
            "user_id": str(user["_id"]),
            "email": email,
            "used": False,
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
        })
        subject, html = reset_password_email(user["name"], token)
        fire_and_forget(send_email(to=email, subject=subject, html=html))
    return {"ok": True, "message": "Se o email existir, enviaremos o link de redefinição."}


@router.post("/auth/reset-password")
async def reset_password(body: ResetPasswordIn):
    doc = await db.password_reset_tokens.find_one({"token": body.token})
    if not doc or doc.get("used"):
        raise HTTPException(status_code=400, detail="Token inválido ou já utilizado")
    expires = doc["expires_at"]
    if isinstance(expires, str):
        expires = datetime.fromisoformat(expires)
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token expirado")
    await db.users.update_one(
        {"_id": ObjectId(doc["user_id"])},
        {"$set": {"password_hash": hash_password(body.password)}},
    )
    await db.password_reset_tokens.update_one({"token": body.token}, {"$set": {"used": True}})
    return {"ok": True}


@router.get("/auth/export")
async def export_data(user=Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).to_list(200)
    licenses = await db.licenses.find({"user_id": user["id"]}, {"_id": 0}).to_list(200)
    for col in (orders, licenses):
        for item in col:
            for k, v in item.items():
                if isinstance(v, datetime):
                    item[k] = v.isoformat()
    return {"user": user, "orders": orders, "licenses": licenses}


@router.delete("/auth/account")
async def delete_account(response: Response, user=Depends(get_current_user)):
    await db.users.delete_one({"_id": ObjectId(user["id"])})
    await db.licenses.update_many({"user_id": user["id"]}, {"$set": {"status": "revoked"}})
    clear_auth_cookies(response)
    return {"ok": True}
