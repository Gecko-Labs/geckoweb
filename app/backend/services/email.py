"""Emails transacionais GeckoLabs via proxy gerenciado Emergent (Resend)."""
import asyncio
import ipaddress
import logging
import os
import re
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse

import httpx

logger = logging.getLogger(__name__)

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "GeckoLabs")
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> str | None:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to or EMAIL_REPLY_TO:
        payload["contact_email"] = reply_to or EMAIL_REPLY_TO
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
        return resp.json().get("id")
    except Exception as e:
        logger.error("Email send error: %s", e)
        return None


def fire_and_forget(coro) -> None:
    task = asyncio.create_task(coro)
    task.add_done_callback(
        lambda t: logger.error("Background email failed: %s", t.exception()) if t.exception() else None
    )


def _layout(title: str, body: str) -> str:
    return (
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
        'style="background:#0E1217;padding:32px 16px"><tr><td align="center">'
        '<table role="presentation" width="560" cellpadding="0" cellspacing="0" '
        'style="background:#13181F;border:1px solid #1A222B;border-radius:12px;'
        'font-family:Arial,sans-serif;color:#F3F5F7">'
        f'<tr><td style="padding:28px 32px 8px;font-size:12px;letter-spacing:3px;'
        f'color:#10B981;font-weight:bold">GECKOLABS</td></tr>'
        f'<tr><td style="padding:0 32px 8px;font-size:22px;font-weight:bold">{escape(title)}</td></tr>'
        f'<tr><td style="padding:8px 32px 28px;font-size:14px;line-height:1.7;color:#9BA3AF">{body}</td></tr>'
        f'<tr><td style="padding:16px 32px;border-top:1px solid #1A222B;font-size:11px;color:#606B7B">'
        f'Enviado por {escape(EMAIL_FROM_NAME)}. Nunca pedimos sua senha ou dados de cartão por email.'
        "</td></tr></table></td></tr></table>"
    )


def welcome_email(name: str) -> tuple[str, str]:
    body = (
        f"<p>Olá, {escape(name)}.</p>"
        "<p>Sua conta GeckoLabs foi criada com sucesso. Explore o catálogo de softwares, "
        "plugins e runtimes de engenharia.</p>"
        f'<p><a href="{FRONTEND_URL}/products" style="color:#10B981">Explorar o catálogo</a></p>'
    )
    return "Bem-vindo à GeckoLabs", _layout("Conta criada", body)


def reset_password_email(name: str, token: str) -> tuple[str, str]:
    link = f"{FRONTEND_URL}/reset-password?token={token}"
    body = (
        f"<p>Olá, {escape(name)}.</p>"
        "<p>Recebemos uma solicitação para redefinir a senha da sua conta. "
        "O link expira em 1 hora. Se não foi você, ignore este email.</p>"
        f'<p><a href="{link}" style="color:#10B981">Redefinir minha senha</a></p>'
    )
    return "Redefinição de senha — GeckoLabs", _layout("Redefinir senha", body)


def order_confirmed_email(name: str, order: dict, keys: list[str]) -> tuple[str, str]:
    items_html = "".join(
        f'<li style="margin-bottom:6px">{escape(i["name"])} '
        f'<span style="color:#606B7B">({escape(i["tier"])})</span></li>'
        for i in order["items"]
    )
    keys_html = "".join(
        f'<div style="font-family:monospace;background:#0E1217;border:1px solid #1A222B;'
        f'border-radius:6px;padding:8px 12px;margin:6px 0;color:#10B981">{escape(k)}</div>'
        for k in keys
    )
    total = order["total_cents"] / 100
    body = (
        f"<p>Olá, {escape(name)}. Seu pagamento foi aprovado.</p>"
        f"<p>Pedido <strong style='color:#F3F5F7'>{escape(order['order_id'])}</strong> "
        f"— total US$ {total:,.2f}</p>"
        f"<ul style='padding-left:18px'>{items_html}</ul>"
        "<p style='color:#F3F5F7;margin-bottom:4px'>Suas chaves de licença:</p>"
        f"{keys_html}"
        f'<p><a href="{FRONTEND_URL}/account" style="color:#10B981">Acessar minha conta e downloads</a></p>'
    )
    return f"Pedido {order['order_id']} confirmado — GeckoLabs", _layout("Pagamento aprovado", body)
