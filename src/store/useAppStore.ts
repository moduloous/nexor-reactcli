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

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'Processing' | 'Completed' | 'Cancelled';
}

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertData {
  visible: boolean;
  title: string;
  message: string;
  buttons?: AlertButton[];
}

export interface AppState {
  // Auth
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;

  // User
  user: UserProfile | null;

  // Cart
  cart: CartItem[];
  cartTotal: number;

  // Orders
  orders: Order[];

  // Custom Alert
  alertData: AlertData;

  // Auth Actions
  setAuth: (accessToken: string, refreshToken: string, user: UserProfile | any) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;

  // Cart Actions
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;

  // Order Actions
  addOrder: (order: Order) => void;

  // Alert Actions
  showAlert: (title: string, message: string, buttons?: AlertButton[]) => void;
  hideAlert: () => void;
}

// ─── Helpers ──────────────────────────────────────────────

const calculateTotal = (cart: CartItem[]): number =>
  cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

// ─── Store ────────────────────────────────────────────────

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  isAuthenticated: false,
  isLoading: false,
  accessToken: null,
  refreshToken: null,
  user: null,
  cart: [],
  cartTotal: 0,
  orders: [],
  alertData: { visible: false, title: '', message: '' },

  // Auth Actions
  setAuth: (accessToken, refreshToken, user) =>
    set({ isAuthenticated: true, accessToken, refreshToken, user }),

  logout: () =>
    set({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      cart: [],
      cartTotal: 0,
      orders: [],
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
  
  // Order Actions
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),

  // Alert Actions
  showAlert: (title, message, buttons) => set({ alertData: { visible: true, title, message, buttons } }),
  hideAlert: () => set((state) => ({ alertData: { ...state.alertData, visible: false } })),
}));
