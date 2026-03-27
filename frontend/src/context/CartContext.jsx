import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem, clearCart as apiClearCart } from '../services/storeApi';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [cartCount, setCartCount] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setCartLoading(true);
      const { data } = await getCart();
      setCart(data);
      setCartCount(data.items?.reduce((sum, i) => sum + i.quantity, 0) || 0);
    } catch {
      // Carrello vuoto o guest senza sessione: nessun errore visibile
      setCart({ items: [], subtotal: 0 });
      setCartCount(0);
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (kitId, quantity = 1) => {
    await apiAddToCart(kitId, quantity);
    await fetchCart();
  };

  const updateItem = async (itemId, quantity) => {
    await apiUpdateCartItem(itemId, quantity);
    await fetchCart();
  };

  const removeItem = async (itemId) => {
    await apiRemoveCartItem(itemId);
    await fetchCart();
  };

  const emptyCart = async () => {
    await apiClearCart();
    setCart({ items: [], subtotal: 0 });
    setCartCount(0);
  };

  return (
    <CartContext.Provider value={{ cart, cartCount, cartLoading, fetchCart, addToCart, updateItem, removeItem, emptyCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};