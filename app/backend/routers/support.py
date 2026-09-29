import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from database import db
from models import SupportIn
from security import get_current_user
from services.email import fire_and_forget, send_email

router = APIRouter(tags=["support"])


@router.post("/support")
async def create_ticket(body: SupportIn):
    ticket_id = "SUP-" + uuid.uuid4().hex[:6].upper()

    name = body.name.strip()
    email = body.email.lower()
    subject = body.subject.strip()
    message = body.message.strip()

    await db.support_tickets.insert_one({
        "ticket_id": ticket_id,
        "name": name,
        "email": email,
        "subject": subject,
        "message": message,
        "status": "open",
        "created_at": datetime.now(timezone.utc),
    })

    html = f"""
    <h2>Novo ticket de suporte</h2>

    <p>
        <strong>ID do ticket:</strong> {ticket_id}
    </p>

    <p>
        <strong>Nome:</strong> {name}<br>
        <strong>Email:</strong> {email}<br>
        <strong>Assunto:</strong> {subject}
    </p>

    <hr>

    <p>
        <strong>Mensagem:</strong>
    </p>

    <p>{message}</p>
    """

    fire_and_forget(
        send_email(
            to="geckolabs.support@gmail.com",
            subject=f"[{ticket_id}] {subject}",
            html=html,
            reply_to=email,
        )
    )

    return {
        "ticket_id": ticket_id,
        "status": "open",
    }


@router.get("/support/mine")
async def my_tickets(user=Depends(get_current_user)):
    tickets = await db.support_tickets.find(
        {"email": user["email"]},
        {"_id": 0, "message": 0},
    ).sort("created_at", -1).to_list(50)

    for ticket in tickets:
        if hasattr(ticket.get("created_at"), "isoformat"):
            ticket["created_at"] = ticket["created_at"].isoformat()

    return tickets