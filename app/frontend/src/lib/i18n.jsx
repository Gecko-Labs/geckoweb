import { createContext, useContext, useState, useCallback } from "react";

const DICT = {
  pt: {
    "nav.products": "Produtos", "nav.support": "Suporte", "nav.account": "Minha conta",
    "nav.cart": "Carrinho", "nav.login": "Entrar", "nav.register": "Criar conta", "nav.logout": "Sair",
    "btn.buy": "Comprar", "btn.addToCart": "Adicionar ao carrinho", "btn.checkout": "Finalizar compra",
    "btn.save": "Salvar", "btn.cancel": "Cancelar", "btn.send": "Enviar",
    "cart.empty": "Seu carrinho está vazio.", "cart.total": "Total", "cart.subtotal": "Subtotal",
    "pay.success": "Pagamento aprovado", "pay.cancel": "Pagamento cancelado",
    "auth.email": "E-mail", "auth.password": "Senha", "auth.forgot": "Esqueci minha senha",
  },
  en: {
    "nav.products": "Products", "nav.support": "Support", "nav.account": "My account",
    "nav.cart": "Cart", "nav.login": "Sign in", "nav.register": "Create account", "nav.logout": "Sign out",
    "btn.buy": "Buy", "btn.addToCart": "Add to cart", "btn.checkout": "Checkout",
    "btn.save": "Save", "btn.cancel": "Cancel", "btn.send": "Send",
    "cart.empty": "Your cart is empty.", "cart.total": "Total", "cart.subtotal": "Subtotal",
    "pay.success": "Payment approved", "pay.cancel": "Payment cancelled",
    "auth.email": "Email", "auth.password": "Password", "auth.forgot": "Forgot my password",
  },
};

const I18nContext = createContext(null);

const initialLang = () =>
  localStorage.getItem("gecko_lang") ||
  (navigator.language?.toLowerCase().startsWith("pt") ? "pt" : "en");

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);

  const setLang = useCallback((l) => {
    localStorage.setItem("gecko_lang", l);
    setLangState(l);
  }, []);

  const t = useCallback((key) => DICT[lang]?.[key] ?? DICT.pt[key] ?? key, [lang]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);