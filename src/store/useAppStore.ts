import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  module: 'food' | 'medicine' | 'shopping';
}

export interface AppState {
  // Auth
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;

  // User
  user: UserProfile | null;

  // Cart
  cart: CartItem[];
  cartTotal: number;

  // Auth Actions
  setAuth: (token: string, user: UserProfile) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;

  // Cart Actions
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

// ─── Helpers ──────────────────────────────────────────────

const calculateTotal = (cart: CartItem[]): number =>
  cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

// ─── Store ────────────────────────────────────────────────

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  isAuthenticated: false,
  isLoading: false,
  token: null,
  user: null,
  cart: [],
  cartTotal: 0,

  // Auth Actions
  setAuth: (token, user) =>
    set({ isAuthenticated: true, token, user }),

  logout: () =>
    set({
      isAuthenticated: false,
      token: null,
      user: null,
      cart: [],
      cartTotal: 0,
    }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  // Cart Actions
  addToCart: (item) => {
    const { cart } = get();
    const existing = cart.find((i) => i.id === item.id);

    let newCart: CartItem[];
    if (existing) {
      newCart = cart.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
      );
    } else {
      newCart = [...cart, { ...item, quantity: 1 }];
    }

    set({ cart: newCart, cartTotal: calculateTotal(newCart) });
  },

  removeFromCart: (itemId) => {
    const newCart = get().cart.filter((i) => i.id !== itemId);
    set({ cart: newCart, cartTotal: calculateTotal(newCart) });
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(itemId);
      return;
    }
    const newCart = get().cart.map((i) =>
      i.id === itemId ? { ...i, quantity } : i,
    );
    set({ cart: newCart, cartTotal: calculateTotal(newCart) });
  },

  clearCart: () => set({ cart: [], cartTotal: 0 }),
}));
