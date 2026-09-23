"""Idempotent Stripe catalog setup for GeckoLabs Store (Flow A)."""
import os
from dotenv import load_dotenv

load_dotenv()

import stripe

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or "sk_test_emergent"

SMP_COUNTRIES = {
    "AU", "AT", "BE", "BG", "CA", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
    "DE", "GI", "GR", "HK", "HU", "IE", "IT", "JP", "LV", "LI", "LT", "LU",
    "MT", "NL", "NO", "PL", "PT", "RO", "SG", "SK", "SI", "ES", "SE", "CH",
    "GB", "US",
}

CATALOG = [
    {"emergent_product_id": "gecko-trace-ultra", "name": "GeckoTrace Ultra — Kernel eBPF Observability Suite",
     "prices": [{"lookup_key": "gecko-trace-ultra_standard", "amount": 18900},
                {"lookup_key": "gecko-trace-ultra_enterprise", "amount": 74900}]},
    {"emergent_product_id": "prism-mesh-addon", "name": "PrismMesh — Envoy & Istio Service Mesh Accelerator",
     "prices": [{"lookup_key": "prism-mesh-addon_standard", "amount": 14900},
                {"lookup_key": "prism-mesh-addon_enterprise", "amount": 59000}]},
    {"emergent_product_id": "poly-vault-crypto", "name": "PolyVault HSM — Cryptographic Secret Enclave",
     "prices": [{"lookup_key": "poly-vault-crypto_standard", "amount": 22900},
                {"lookup_key": "poly-vault-crypto_enterprise", "amount": 89900}]},
    {"emergent_product_id": "gecko-lens-ide", "name": "GeckoLens AI — IDE Architecture Co-Pilot",
     "prices": [{"lookup_key": "gecko-lens-ide_standard", "amount": 7900},
                {"lookup_key": "gecko-lens-ide_enterprise", "amount": 29000}]},
    {"emergent_product_id": "stream-citus-sync", "name": "StreamSync Postgres — Change Data Capture Kernel",
     "prices": [{"lookup_key": "stream-citus-sync_standard", "amount": 12900},
                {"lookup_key": "stream-citus-sync_enterprise", "amount": 49000}]},
    {"emergent_product_id": "apex-wasm-runtime", "name": "ApexWasm — Edge Micro-Container Virtualizer",
     "prices": [{"lookup_key": "apex-wasm-runtime_standard", "amount": 16900},
                {"lookup_key": "apex-wasm-runtime_enterprise", "amount": 64000}]},
]

COUPONS = [
    {"id": "GECKO-LAUNCH-20", "percent_off": 20, "name": "GeckoLabs Launch — 20% off"},
    {"id": "ARCHITECT-10", "percent_off": 10, "name": "Architect Program — 10% off"},
]


def get_or_create_product(entry):
    for p in stripe.Product.list(active=True).auto_paging_iter():
        if p.to_dict().get("metadata", {}).get("emergent_product_id") == entry["emergent_product_id"]:
            return p
    return stripe.Product.create(
        name=entry["name"], tax_code="txcd_10000000",
        metadata={"managed_by": "emergent", "emergent_product_id": entry["emergent_product_id"]},
    )


def ensure_price(product, price_def):
    existing = stripe.Price.list(lookup_keys=[price_def["lookup_key"]], active=True, limit=1).data
    if existing and (existing[0].unit_amount != price_def["amount"] or existing[0].currency != "usd"):
        stripe.Price.modify(existing[0].id, active=False)
        existing = []
    if not existing:
        stripe.Price.create(
            product=product.id, unit_amount=price_def["amount"], currency="usd",
            lookup_key=price_def["lookup_key"], transfer_lookup_key=True,
        )
        print("  created price", price_def["lookup_key"])
    else:
        print("  price ok", price_def["lookup_key"])


def ensure_coupon(c):
    try:
        stripe.Coupon.retrieve(c["id"])
        print("coupon ok", c["id"])
    except stripe.error.InvalidRequestError:
        stripe.Coupon.create(id=c["id"], percent_off=c["percent_off"], name=c["name"], duration="once")
        print("created coupon", c["id"])


def main():
    account = stripe.Account.retrieve()
    country = account["country"]
    print("Stripe account country:", country)
    tax_mode = "full" if country in SMP_COUNTRIES else "calc_only"
    print("TAX_MODE:", tax_mode)

    try:
        settings = stripe.tax.Settings.retrieve()
        if not (settings.head_office and getattr(settings.head_office, "address", None)):
            stripe.tax.Settings.modify(
                head_office={"address": {"country": country, "line1": "100 Innovation Drive",
                                         "city": "Austin", "state": "TX", "postal_code": "78701"}},
                defaults={"tax_behavior": "exclusive"},
            )
            print("tax settings configured")
    except Exception as e:
        print("tax settings skipped:", e)

    for entry in CATALOG:
        product = get_or_create_product(entry)
        print("product ok", entry["emergent_product_id"])
        for price_def in entry["prices"]:
            ensure_price(product, price_def)

    for coupon in COUPONS:
        ensure_coupon(coupon)
        
print("DONE tax_mode=" + tax_mode)


if __name__ == "__main__":
    main()
