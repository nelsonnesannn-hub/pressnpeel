"use client";

// Cart state — a single client store shared by the header badge, the product
// and category pages, and the checkout page. Persisted to localStorage.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  clearCartStorage,
  itemCount,
  loadCart,
  mergeItems,
  lineCentsForQuantity,
  saveCart,
  type CartItem,
} from "@/lib/cart";

type CartContextValue = {
  items: CartItem[];
  count: number;
  ready: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  addItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const value = useCartValue();
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** The provider and the public hook share one implementation. */
function useCartValue(): CartContextValue {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const hydrated = useRef(false);

  // Load once on mount (localStorage is browser-only).
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    setItems(loadCart());
    setReady(true);
  }, []);

  // Persist on every change, but only after the initial hydration.
  useEffect(() => {
    if (!ready) return;
    saveCart(items);
  }, [items, ready]);

  const addItems = useCallback((incoming: CartItem[]) => {
    setItems((prev) => mergeItems(prev, incoming));
  }, []);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => mergeItems(prev, [item]));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = Math.max(1, Math.min(100000, Math.floor(quantity) || 1));
        const updated = { ...item, quantity: next };
        return { ...updated, lineCents: lineCentsForQuantity(updated, next) };
      })
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    clearCartStorage();
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: itemCount(items),
      ready,
      open,
      setOpen,
      addItems,
      addItem,
      removeItem,
      setQuantity,
      clear,
    }),
    [items, ready, open, addItems, addItem, removeItem, setQuantity, clear]
  );

  return value;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
