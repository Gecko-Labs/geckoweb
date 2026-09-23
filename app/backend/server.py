from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

import logging
import os

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from database import client
from routers import auth, checkout, downloads, licenses, orders, products, support
from seed import ensure_indexes, seed_all

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="GeckoLabs Store API")

for module in (auth, products, checkout, orders, licenses, downloads, support):
    app.include_router(module.router, prefix="/api")


@app.get("/api/")
async def root():
    return {"service": "geckolabs-store", "status": "operational"}


frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[frontend_url, "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    wait ensure_indexes()
    await seed_all()
    logger.info("GeckoLabs Store API pronta")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
