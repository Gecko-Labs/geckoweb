from fastapi import APIRouter, Depends, HTTPException

from database import db
from security import get_current_user

router = APIRouter(tags=["licenses"])


def serialize(doc: dict) -> dict:
    doc = {k: v for k, v in doc.items() if k != "_id"}
    for k, v in doc.items():
        if hasattr(v, "isoformat"):
            doc[k] = v.isoformat()
    return doc


@router.get("/licenses")
async def list_licenses(user=Depends(get_current_user)):
    licenses = await db.licenses.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    result = []
    for lic in licenses:
        product = await db.products.find_one({"slug": lic["product_slug"]}, {"_id": 0, "image": 1, "version": 1})
        result.append({**serialize(lic), "product": product})
    return result


@router.post("/licenses/{key}/revoke")
async def revoke_license(key: str, user=Depends(get_current_user)):
    result = await db.licenses.update_one(
        {"key": key, "user_id": user["id"], "status": "active"},
        {"$set": {"status": "revoked"}},
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Licença não encontrada ou já revogada")
    return {"ok": True}