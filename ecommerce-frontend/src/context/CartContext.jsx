import { createContext, useReducer, useEffect, useState, useContext } from "react";
import { cartAPI } from "../services/api";
import toast from "react-hot-toast";

const CartContext = createContext(null);

// Cart reducer for state management
function cartReducer(state, action) {
  switch (action.type) {
    case "SET_CART":
      return {
        items: action.payload.items || [],
        pricing: {
          subtotal: action.payload.pricing?.subtotal ?? 0,
          shipping: action.payload.pricing?.shipping ?? 0,
          discount: action.payload.pricing?.discount ?? 0,
          total: action.payload.pricing?.total ?? 0,
        },
      };
    case "ADD_ITEM":
      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map((item) =>
          item.product._id === action.payload.productId ? { ...item, quantity: action.payload.quantity } : item
        ),
      };

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.product._id !== action.payload),
      };

    case "CLEAR_CART":
      return {
        items: [],
        pricing: { subtotal: 0, shipping: 0, discount: 0, total: 0 },
      };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, {
    items: [],
    pricing: { subtotal: 0, shipping: 0, discount: 0, total: 0 },
  });

  const [loading, setLoading] = useState(false);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const { data } = await cartAPI.getCart();
      dispatch({ type: "SET_CART", payload: data.data });
    } catch (error) {
      console.error("Error loading cart:", error);
      // If user not logged in, cart might be empty
      if (error.response?.status !== 401) {
        toast.error("Failed to load cart");
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const { data } = await cartAPI.addItem(productId, quantity);
      dispatch({ type: "SET_CART", payload: data.data });
      toast.success("Added to cart!");
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add to cart";
      toast.error(message);
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await cartAPI.updateItem(productId, quantity);
      dispatch({ type: "SET_CART", payload: data.data });
      toast.success("Cart updated");
    } catch (error) {
      toast.error("Failed to update cart");
      throw error;
    }
  };

  const removeItem = async (productId) => {
    try {
      await cartAPI.removeItem(productId);
      dispatch({ type: "REMOVE_ITEM", payload: productId });
      toast.success("Item removed");
    } catch (error) {
      toast.error("Failed to remove item");
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      dispatch({ type: "CLEAR_CART" });
      toast.success("Cart cleared");
    } catch (error) {
      toast.error("Failed to clear cart");
      throw error;
    }
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    itemCount: cart.items.length,
    refreshCart: loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
