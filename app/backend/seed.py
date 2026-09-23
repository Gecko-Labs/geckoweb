import os
from datetime import datetime, timezone

from catalog import PRODUCTS
from database import db
from security import hash_password, verify_password

CREDENTIALS_FILE = "/app/memory/test_credentials.md"


async def ensure_indexes() -> None:
    await db.users.create_index("email", unique=True)
    await db.products.create_index("slug", unique=True)
    await db.orders.create_index("order_id", unique=True)
    await db.orders.create_index("user_id")
    await db.licenses.create_index("key", unique=True)
    await db.licenses.create_index("user_id")
    await db.payment_transactions.create_index("session_id", unique=True)
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.login_attempts.create_index("identifier")
    await db.support_tickets.create_index("ticket_id", unique=True)


async def seed_products() -> None:
    for product in PRODUCTS:
        await db.products.update_one(
            {"slug": product["slug"]},
            {"$set": {**product, "updated_at": datetime.now(timezone.utc)}},
            upsert=True,
        )


async def seed_user(email: str, password: str, name: str, role: str) -> None:
    existing = await db.users.find_one({"email": email})
    if existing is None:
        await db.users.insert_one({
            "name": name,
            "email": email,
            "password_hash": hash_password(password),
            "role": role,
            "created_at": datetime.now(timezone.utc),
        })
    elif not verify_password(password, existing["password_hash"]):
        await db.users.update_one(
            {"email": email},
            {"$set": {"password_hash": hash_password(password), "role": role}},
        )


async def seed_all() -> None:
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@geckolabs.dev")
    admin_password = os.environ.get("ADMIN_PASSWORD", "GeckoAdmin2026!")
    await seed_user(admin_email, admin_password, "Gecko Admin", "admin")
    await seed_user("demo@geckolabs.dev", "GeckoDemo2026!", "Arquiteto Demo", "user")
    await seed_products()

    with open(CREDENTIALS_FILE, "w") as f:
        f.write(
            "# Test Credentials\n\n"
            "## Admin\n"
            f"- Email: {admin_email}\n"
            f"- Password: {admin_password}\n"
            "- Role: admin\n\n"
            "## Demo User\n"
            "- Email: demo@geckolabs.dev\n"
            "- Password: GeckoDemo2026!\n"
            "- Role: user\n\n"
            "## Auth Endpoints\n"
            "- POST /api/auth/register\n"
            "- POST /api/auth/login\n"
            "- POST /api/auth/logout\n"
            "- GET /api/auth/me\n"
            "- POST /api/auth/refresh\n"
            "- POST /api/auth/forgot-password\n"
            "- POST /api/auth/reset-password\n"
        )
