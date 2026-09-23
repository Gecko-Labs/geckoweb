# Compatibilidade: o checkout original está em backend/checkout.py.
# server.py importa `checkout` a partir de `routers`, então este módulo reexporta o router.
from checkout import router

__all__ = ["router"]
