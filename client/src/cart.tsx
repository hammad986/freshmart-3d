import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "./api";
import { useAuth } from "./auth";
import { Cart, CartItem } from "./types";

interface CartContextValue {
  items: CartItem[];
  total: number;
  count: number;
  refresh: () => Promise<void>;
  add: (productId: number) => Promise<void>;
  update: (itemId: number, quantity: number) => Promise<void>;
  remove: (itemId: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  const apply = useCallback((cart: Cart) => {
    setItems(cart.items);
    setTotal(cart.total);
  }, []);

  const refresh = useCallback(async () => {
    if (!token) {
      setItems([]);
      setTotal(0);
      return;
    }
    apply(await api<Cart>("/cart", {}, token));
  }, [token, apply]);

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  const add = useCallback(
    async (productId: number) => {
      apply(
        await api<Cart>("/cart", { method: "POST", body: JSON.stringify({ product_id: productId }) }, token)
      );
    },
    [token, apply]
  );

  const update = useCallback(
    async (itemId: number, quantity: number) => {
      apply(
        await api<Cart>(`/cart/${itemId}`, { method: "PATCH", body: JSON.stringify({ quantity }) }, token)
      );
    },
    [token, apply]
  );

  const remove = useCallback(
    async (itemId: number) => {
      apply(await api<Cart>(`/cart/${itemId}`, { method: "DELETE" }, token));
    },
    [token, apply]
  );

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, total, count, refresh, add, update, remove }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
