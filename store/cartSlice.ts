import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AddOn {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  isDeal: boolean;
  addOns?: AddOn[];
}

interface CartState {
  items: CartItem[];
  total: number;
  totalQuantity: number;
}

const initialState: CartState = {
  items: [],
  total: 0,
  totalQuantity: 0,
};

interface LoyaltyItem {
  id: number;
  item_name: string;
  points_required: number;
  description: string;
  image_url: string;
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id && item.isDeal === action.payload.isDeal
      );

      if (existingItemIndex !== -1) {
        state.items[existingItemIndex].quantity += action.payload.quantity;
        if (action.payload.addOns) {
          action.payload.addOns.forEach(newAddOn => {
            const existingAddOnIndex = state.items[existingItemIndex].addOns?.findIndex(
              addOn => addOn.id === newAddOn.id
            );
            if (existingAddOnIndex !== undefined && existingAddOnIndex !== -1) {
              state.items[existingItemIndex].addOns![existingAddOnIndex].quantity += newAddOn.quantity;
            } else {
              state.items[existingItemIndex].addOns?.push(newAddOn);
            }
          });
        }
      } else {
        state.items.push(action.payload);
      }

      state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.total = state.items.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const addOnsTotal = item.addOns?.reduce((addOnSum, addOn) => addOnSum + addOn.price * addOn.quantity, 0) || 0;
        return sum + itemTotal + addOnsTotal;
      }, 0);
    },
    removeFromCart: (state, action: PayloadAction<{ id: number; isDeal: boolean }>) => {
      state.items = state.items.filter(
        item => !(item.id === action.payload.id && item.isDeal === action.payload.isDeal)
      );
      state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.total = state.items.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const addOnsTotal = item.addOns?.reduce((addOnSum, addOn) => addOnSum + addOn.price * addOn.quantity, 0) || 0;
        return sum + itemTotal + addOnsTotal;
      }, 0);
    },
    updateQuantity: (state, action: PayloadAction<{ id: number; isDeal: boolean; quantity: number }>) => {
      const item = state.items.find(
        item => item.id === action.payload.id && item.isDeal === action.payload.isDeal
      );
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter(
            i => !(i.id === item.id && i.isDeal === item.isDeal)
          );
        }
      }
      state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.total = state.items.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const addOnsTotal = item.addOns?.reduce((addOnSum, addOn) => addOnSum + addOn.price * addOn.quantity, 0) || 0;
        return sum + itemTotal + addOnsTotal;
      }, 0);
    },
    updateAddOnQuantity: (state, action: PayloadAction<{ itemId: number; isDeal: boolean; addOnId: number; quantity: number }>) => {
      const item = state.items.find(
        item => item.id === action.payload.itemId && item.isDeal === action.payload.isDeal
      );
      if (item && item.addOns) {
        const addOn = item.addOns.find(addOn => addOn.id === action.payload.addOnId);
        if (addOn) {
          addOn.quantity = action.payload.quantity;
          if (addOn.quantity <= 0) {
            item.addOns = item.addOns.filter(a => a.id !== addOn.id);
          }
        }
      }
      state.total = state.items.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const addOnsTotal = item.addOns?.reduce((addOnSum, addOn) => addOnSum + addOn.price * addOn.quantity, 0) || 0;
        return sum + itemTotal + addOnsTotal;
      }, 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.totalQuantity = 0;
    },
    updateCartWithImages: (state, action: PayloadAction<CartItem[]>) => {
      action.payload.forEach((newItem) => {
        const existingItem = state.items.find(
          item => item.id === newItem.id && item.isDeal === newItem.isDeal
        );
        if (existingItem) {
          existingItem.image_url = newItem.image_url;
        }
      });
    },
    addLoyaltyItemToCart: (state, action: PayloadAction<LoyaltyItem>) => {
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id && item.isDeal === false
      );

      if (existingItemIndex !== -1) {
        state.items[existingItemIndex].quantity += 1;
      } else {
        const newItem: CartItem = {
          id: action.payload.id,
          name: action.payload.item_name,
          price: 0, // Loyalty items are free, so price is 0
          quantity: 1,
          image_url: action.payload.image_url,
          isDeal: false,
          addOns: [],
        };
        state.items.push(newItem);
      }

      state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
      // Total price doesn't change because loyalty items are free
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  updateAddOnQuantity,
  clearCart,
  updateCartWithImages,
  addLoyaltyItemToCart,
} = cartSlice.actions;

export default cartSlice.reducer;
