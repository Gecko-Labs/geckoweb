import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "gecko-cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  });
  const [promo, setPromo] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  const addItem = useCallback((product, tier = "standard") => {
    setItems((prev) => {
      if (prev.some((i) => i.slug === product.slug && i.tier === tier)) return prev;
      return [
        ...prev,
        {
          slug: product.slug,
          tier,
          name: product.name,
          tagline: product.tagline,
          image: product.image,
          price: product.prices[tier],
        },
      ];
    });
    setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((slug, tier) => {
    setItems((prev) => prev.filter((i) => !(i.slug === slug && i.tier === tier)));
  }, []);

  const hasItem = useCallback(
    (slug) => items.some((i) => i.slug === slug),
    [items],
  );

  const clear = useCallback(() => {
    setItems([]);
    setPromo(null);
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price, 0), [items]);
  const discount = promo ? Math.round((subtotal * promo.percent) / 100) : 0;
  const total = subtotal - discount;

  const value = {
    items,
    promo,
    setPromo,
    addItem,
    removeItem,
    hasItem,
    clear,
    subtotal,
    discount,
    total,
    count: items.length,
    drawerOpen,
    setDrawerOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
