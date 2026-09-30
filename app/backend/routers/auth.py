import os
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, Request, Response

from models import ForgotPasswordIn, LoginIn, RegisterIn

router = APIRouter(tags=["auth"])

LICENSE_API_URL = os.getenv("GECKOLICENSE_API_URL", "").rstrip("/")
LICENSE_ADMIN_EMAIL = os.getenv("GECKOLICENSE_ADMIN_EMAIL", "")
LICENSE_ADMIN_PASSWORD = os.getenv("GECKOLICENSE_ADMIN_PASSWORD", "")


def require_license_api() -> str:
    if not LICENSE_API_URL:
        raise HTTPException(status_code=503, detail="GeckoLicense API não configurada")
    return LICENSE_API_URL


async def license_request(method: str, path: str, **kwargs: Any) -> httpx.Response:
    base = require_license_api()
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=False) as client:
            return await client.request(method, f"{base}{path}", **kwargs)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Não foi possível comunicar com o GeckoLicense") from exc


def response_data(response: httpx.Response) -> dict:
    try:
        data = response.json()
    except ValueError:
        data = {"message": response.text}
    if not isinstance(data, dict):
        data = {"message": str(data)}
    return data


def license_error(response: httpx.Response) -> HTTPException:
    data = response_data(response)
    return HTTPException(
        status_code=response.status_code if response.status_code < 500 else 502,
        detail=data.get("message") or data.get("detail") or "Erro no GeckoLicense",
    )


@router.post("/auth/login")
async def login(body: LoginIn):
    response = await license_request(
        "POST",
        "/api/auth/tenant/login",
        json={"email": body.email.lower(), "password": body.password},
    )
    if not response.is_success:
        raise license_error(response)

    data = response_data(response)
    tenant = data.get("tenant") or {}
    return {
        "token": data.get("token"),
        "id": tenant.get("id"),
        "name": tenant.get("fullName"),
        "email": tenant.get("email"),
        "avatar_url": tenant.get("avatarUrl"),
        "role": "user",
    }


@router.post("/auth/register")
async def register(body: RegisterIn):
    if not LICENSE_ADMIN_EMAIL or not LICENSE_ADMIN_PASSWORD:
        raise HTTPException(status_code=503, detail="Cadastro no GeckoLicense não está configurado")

    # O GeckoLicense já possui o endpoint de criação de tenant protegido por AdminOnly.
    # O site usa somente as credenciais administrativas armazenadas como variáveis de
    # ambiente da Vercel para executar esse cadastro; elas nunca chegam ao navegador.
    admin_login = await license_request(
        "POST",
        "/api/auth/admin/login",
        json={"email": LICENSE_ADMIN_EMAIL, "password": LICENSE_ADMIN_PASSWORD},
    )
    if not admin_login.is_success:
        raise HTTPException(status_code=502, detail="Não foi possível autorizar o cadastro no GeckoLicense")

    admin_data = response_data(admin_login)
    admin_token = admin_data.get("token")
    if not admin_token:
        raise HTTPException(status_code=502, detail="GeckoLicense não retornou o token administrativo")

    create_tenant = await license_request(
        "POST",
        "/api/tenants",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "fullName": body.name.strip(),
            "email": body.email.lower(),
            "cpf": None,
            "companyName": None,
            "cnpj": None,
            "phone": None,
            "address": None,
            "city": None,
            "state": None,
            "zipCode": None,
            "professionalRegister": None,
            "notes": None,
            "password": body.password,
        },
    )
    if not create_tenant.is_success:
        raise license_error(create_tenant)

    # Retorna imediatamente o mesmo JWT que o aplicativo License usa.
    return await login(LoginIn(email=body.email, password=body.password))


@router.get("/auth/me")
async def me(request: Request):
    token = request.headers.get("Authorization", "")
    if not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Não autenticado")

    response = await license_request("GET", "/api/tenants/me", headers={"Authorization": token})
    if not response.is_success:
        raise license_error(response)

    data = response_data(response)
    return {
        "id": data.get("id"),
        "name": data.get("fullName"),
        "email": data.get("email"),
        "avatar_url": data.get("avatarUrl"),
        "phone": data.get("phone"),
        "professional_register": data.get("professionalRegister"),
        "licenses": data.get("licenses", []),
        "role": "user",
    }


@router.post("/auth/logout")
async def logout():
    # JWT do GeckoLicense é stateless; o cliente remove o token localmente.
    return {"ok": True}


@router.post("/auth/refresh")
async def refresh(request: Request):
    # O GeckoLicense atual não possui refresh token. Validamos o JWT atual.
    return await me(request)


@router.post("/auth/forgot-password")
async def forgot_password(body: ForgotPasswordIn):
    # O servidor GeckoLicense atual não expõe recuperação pública de senha.
    # Não usamos MongoDB para criar uma segunda identidade.
    return {"ok": True, "message": "Se o email existir, enviaremos as instruções de recuperação."}


@router.post("/auth/google")
async def google_login():
    # O OAuth Google já é propriedade do GeckoLicense. O fluxo web precisa de um
    # callback/redirect de produção no próprio servidor antes de poder ser consumido
    # pelo navegador sem duplicar a identidade.
    raise HTTPException(
        status_code=501,
        detail="Login Google do site aguarda o callback web do GeckoLicense.",
    )