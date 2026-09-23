import hashlib
import io
import zipfile
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from catalog import PLATFORMS
from database import db
from security import get_current_user

router = APIRouter(tags=["downloads"])


@router.get("/downloads/{slug}/{platform}")
async def download_artifact(slug: str, platform: str, user=Depends(get_current_user)):
    if platform not in PLATFORMS:
        raise HTTPException(status_code=400, detail="Plataforma inválida")
    license_doc = await db.licenses.find_one(
        {"user_id": user["id"], "product_slug": slug, "status": "active"}
    )
    if not license_doc:
        raise HTTPException(status_code=403, detail="Licença ativa necessária para download")
    product = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    version = product["version"]
    payload = (
        f"{product['name']} {version} ({platform})\n"
        f"Licenciado para: {user['email']}\n"
        f"Build: {hashlib.sha256(f'{slug}-{version}-{platform}'.encode()).hexdigest()[:16]}\n"
    ).encode()
    checksum = hashlib.sha256(payload).hexdigest()

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(
            "README.txt",
            f"{product['name']} — {product['tagline']}\n"
            f"Versão: {version} | Plataforma: {platform}\n\n"
            "Instalação:\n"
            "  1. Extraia este pacote\n"
            "  2. Execute ./install.sh (Linux/macOS) ou install.ps1 (Windows)\n"
            "  3. Ative com sua chave de licença (LICENSE.txt)\n\n"
            "Suporte: https://geckolabs.dev/support\n",
        )
        zf.writestr(
            "LICENSE.txt",
            f"Chave de licença: {license_doc['key']}\n"
            f"Titular: {user['name']} <{user['email']}>\n"
            f"Tipo: {license_doc['tier']}\n"
            f"Ativações permitidas: {license_doc['max_activations']}\n"
            f"Emitida em: {license_doc['created_at']}\n",
        )
        zf.writestr(
            f"bin/{slug}.bin", payload,
        )
        zf.writestr("SHA256SUMS.txt", f"{checksum}  bin/{slug}.bin\n")

    await db.downloads.insert_one({
        "user_id": user["id"],
        "product_slug": slug,
        "platform": platform,
        "at": datetime.now(timezone.utc),
    })

    buf.seek(0)
    filename = f"{slug}-{version}-{platform}.zip"
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
