import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from database import db
from models import SupportIn
from security import get_current_user

router = APIRouter(tags=["support"])


@router.post("/support")
async def create_ticket(body: SupportIn):
    ticket_id = "SUP-" + uuid.uuid4().hex[:6].upper()
    await db.support_tickets.insert_one({
        "ticket_id": ticket_id,
        "name": body.name.strip(),
        "email": body.email.lower(),
        "subject": body.subject.strip(),
        "message": body.message.strip(),
        "status": "open",
        "created_at": datetime.now(timezone.utc),
    })
    return {"ticket_id": ticket_id, "status": "open"}


@router.get("/support/mine")
async def my_tickets(user=Depends(get_current_user)):
    tickets = await db.support_tickets.find(
        {"email": user["email"]}, {"_id": 0, "message": 0}
    ).sort("created_at", -1).to_list(50)
    for t in tickets:
        if hasattr(t.get("created_at"), "isoformat"):
            t["created_at"] = t["created_at"].isoformat()
    return tickets
