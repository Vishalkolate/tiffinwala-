
import { createContext,useContext, useEffect, useState,} from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("tiffin-cart") || "[]"
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("tiffin-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (dish) => {
    setCartItems((previousItems) => {
      const existing = previousItems.find(
        (item) => String(item.id) === String(dish.id)
      );

      if (existing) {
        return previousItems.map((item) =>
          String(item.id) === String(dish.id)
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }

      return [...previousItems, { ...dish, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((items) =>
      items.filter((item) => String(item.id) !== String(id))
    );
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }

    setCartItems((items) =>
      items.map((item) =>
        String(item.id) === String(id)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be inside CartProvider");
  }

  return context;
}
