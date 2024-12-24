import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../utils/supabase';

export interface FavoriteItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  isFavorite: boolean;
}

interface FavoritesState {
  items: FavoriteItem[];
  loading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (userId: string) => {
    try {
      const { data: favoriteItems, error: favoriteError } = await supabase
        .from('favorites')
        .select('menu_item_id')
        .eq('user_id', userId);

      if (favoriteError) {
        throw new Error(`Error fetching favorites: ${favoriteError.message}`);
      }

      if (!favoriteItems || favoriteItems.length === 0) {
        return [];
      }

      const menuItemIds = favoriteItems.map(item => item.menu_item_id);

      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('id, name, description, price, image_url, category')
        .in('id', menuItemIds);

      if (menuError) {
        throw new Error(`Error fetching menu items: ${menuError.message}`);
      }

      return menuItems.map(item => ({
        ...item,
        isFavorite: true
      }));
    } catch (error) {
      console.error('Error in fetchFavorites:', error);
      throw error;
    }
  }
);

export const toggleFavoriteOnServer = createAsyncThunk(
  'favorites/toggleFavoriteOnServer',
  async ({ userId, itemId, isFavorite }: { userId: string; itemId: number; isFavorite: boolean }) => {
    if (isFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('menu_item_id', itemId);

      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, menu_item_id: itemId });

      if (error) throw new Error(error.message);
    }

    return { itemId, isFavorite: !isFavorite };
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearFavorites: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action: PayloadAction<FavoriteItem[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch favorites';
      })
      .addCase(toggleFavoriteOnServer.fulfilled, (state, action) => {
        const { itemId, isFavorite } = action.payload;
        const index = state.items.findIndex(item => item.id === itemId);
        if (index !== -1) {
          if (isFavorite) {
            state.items[index].isFavorite = true;
          } else {
            state.items.splice(index, 1);
          }
        }
      });
  },
});

export const { clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;