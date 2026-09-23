from fastapi import APIRouter, HTTPException

from database import db

router = APIRouter(tags=["products"])

PROJECTION = {"_id": 0}

@router.get("/products")
async def list_products():
    return await db.products.find({}, PROJECTION).to_list(100)


@router.get("/products/{slug}")
async def get_product(slug: str):
    product = await db.products.find_one({"slug": slug}, PROJECTION)
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return product
