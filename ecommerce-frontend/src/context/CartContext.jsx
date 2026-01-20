import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { cartAPI } from "../services/api";
import { toast } from "react-hot-toast";

// =======================
// Initial State
// =======================
const initialState = JSON.parse(localStorage.getItem("guest_cart")) || {
  items: [],
  pricing: {
    subtotal: 0,
    shipping: 0,
    discount: 0,
    total: 0,
  },
};

// =======================
// Reducer
// =======================
function cartReducer(state, action) {
  switch (action.type) {
    case "SET_CART":
      return action.payload;

    case "ADD_ITEM":
      return calculatePricing({
        ...state,
        items: [...state.items, action.payload],
      });

    case "UPDATE_ITEM":
      return calculatePricing({
        ...state,
        items: state.items.map((item) =>
          item.product._id === action.payload.productId ? { ...item, quantity: action.payload.quantity } : item,
        ),
      });

    case "REMOVE_ITEM":
      return calculatePricing({
        ...state,
        items: state.items.filter((item) => item.product._id !== action.payload),
      });

    case "CLEAR_CART":
      return calculatePricing({
        ...state,
        items: [],
      });

    default:
      return state;
  }
}

// =======================
// Pricing Calculation
// =======================
function calculatePricing(cart) {
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const shipping = subtotal > 0 ? 1 : 0;
  const discount = 0;
  const total = subtotal + shipping - discount;

  return {
    ...cart,
    pricing: { subtotal, shipping, discount, total },
  };
}
// =======================
// Context
// =======================
const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// =======================
// Provider
// =======================
export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialState);
  const [loading, setLoading] = useState(false);

  // Total items count
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // =======================
  // Load Cart from API
  // =======================
  const refreshCart = async () => {
    try {
      setLoading(true);
      const res = await cartAPI.getCart();
      dispatch({
        type: "SET_CART",
        payload: {
          ...res.data.data,
          pricing: res.data.data.totals,
        },
      });
    } catch (err) {
      if (err.response?.status === 401) return; // Not logged in
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (!localStorage.getItem("token")) {
  //     localStorage.setItem("guest_cart", JSON.stringify(cart));
  //   }
  // }, [cart]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      refreshCart();
    }
  }, []);
  // =======================
  // Methods
  // =======================

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);

      const res = await cartAPI.addItem({
        productId,
        quantity,
      });

      dispatch({
        type: "SET_CART",
        payload: {
          ...res.data.data,
          pricing: res.data.data.totals,
        },
      });
      toast.success("Added to cart!");
    } catch (err) {
      if (err.response?.status === 401) {
        return toast.error("Please log in first");
      }
      toast.error(err.response?.data?.message || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    console.log("Updating item:", itemId, "to qty:", quantity);
    try {
      setLoading(true);
      const res = await cartAPI.updateItem(itemId, quantity);

      dispatch({
        type: "SET_CART",
        payload: {
          ...res.data.data,
          pricing: res.data.data.totals,
        },
      });
      console.log("Calling:", `/cart/items/${itemId}`);
    } catch (err) {
      if (err.response?.status === 401) return toast.error("Please log in first");
      toast.error("Failed to update quantity");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setLoading(true);
      const res = await cartAPI.removeItem(itemId);

      dispatch({
        type: "SET_CART",
        payload: {
          ...res.data.data,
          pricing: res.data.data.totals,
        },
      });
      toast.info("Item removed");
    } catch (err) {
      if (err.response?.status === 401) return toast.error("Please log in first");
      toast.error("Failed to remove item");
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartAPI.clearCart();

      dispatch({ type: "CLEAR_CART" });
      toast.info("Cart cleared");
    } catch (err) {
      if (err.response?.status === 401) {
        return toast.error("Please log in first");
      }
      toast.error("Failed to clear cart");
    } finally {
      setLoading(false);
    }
  };

  // =======================
  // Provide Context
  // =======================
  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
