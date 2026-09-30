
from fastapi import HTTPException, Request


async def get_current_user(request: Request) -> dict:
    """
    Obtém o usuário autenticado a partir do JWT emitido pelo GeckoLicense.

    O GeckoWeb não mantém uma segunda identidade de usuário.
    A conta oficial pertence ao GeckoLicense.
    """

    token = request.headers.get("Authorization", "")

    if not token.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Não autenticado",
        )

    # Import local para evitar import circular durante a inicialização
    # dos routers.
    from routers.auth import license_request, response_data

    response = await license_request(
        "GET",
        "/api/tenants/me",
        headers={
            "Authorization": token,
        },
    )

    if response.status_code == 401:
        raise HTTPException(
            status_code=401,
            detail="Sessão expirada",
        )

    if not response.is_success:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível validar a conta no GeckoLicense",
        )

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


def public_user(user: dict) -> dict:
    """
    Retorna a representação pública do usuário.

    A identidade já foi validada pelo GeckoLicense,
    portanto não existe consulta adicional ao MongoDB.
    """
    return {
        "id": user.get("id"),
        "name": user.get("name"),
        "email": user.get("email"),
        "avatar_url": user.get("avatar_url"),
        "phone": user.get("phone"),
        "professional_register": user.get("professional_register"),
        "licenses": user.get("licenses", []),
        "role": user.get("role", "user"),
    }

