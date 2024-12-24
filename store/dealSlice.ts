import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../utils/supabase'; // Your Supabase client instance

interface Category {
  id: number;
  name: string;
  image_url: string;
}

interface MenuItem {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
}

export interface Deal {
  id: number;
  name: string;
  description: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  image_url: string;
  isDeal: boolean;
}

interface DealItem {
  id: number;
  deal_id: number;
  menu_item_id: number;
  quantity: number;
  menu_item: MenuItem;
}

interface DealsState {
  deals: Deal[];
  dealItems: Record<number, DealItem[]>;
  loading: boolean;
  error: string | null;
}

const initialState: DealsState = {
  deals: [],
  dealItems: {},
  loading: false,
  error: null,
};

// Async thunk to fetch deals and deal items
export const fetchDeals = createAsyncThunk<
  { deals: Deal[]; dealItems: Record<number, DealItem[]> },
  void,
  { rejectValue: string }
>('deals/fetchDeals', async (_, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        id,
        name,
        description,
        original_price,
        discounted_price,
        discount_percentage,
        image_url,
        deal_items (
          id,
          deal_id,
          menu_item_id,
          quantity,
          menu_items (
            id,
            category,
            name,
            description,
            price,
            image_url,
            is_available
          )
        )
      `)
      .order('discounted_price', { ascending: true });

    if (error) {
      console.error('Error fetching deals:', error);
      return rejectWithValue(`Failed to fetch deals: ${error.message}`);
    }

    if (!data) {
      return rejectWithValue('No data received from the server');
    }

    const deals: Deal[] = [];
    const dealItems: Record<number, DealItem[]> = {};

    data.forEach((deal: any) => {
      if (
        typeof deal.id === 'number' &&
        typeof deal.name === 'string' &&
        typeof deal.description === 'string' &&
        typeof deal.original_price === 'number' &&
        typeof deal.discounted_price === 'number' &&
        typeof deal.discount_percentage === 'number' &&
        typeof deal.image_url === 'string'
      ) {
        deals.push({
          id: deal.id,
          name: deal.name,
          description: deal.description,
          original_price: deal.original_price,
          discounted_price: deal.discounted_price,
          discount_percentage: deal.discount_percentage,
          image_url: deal.image_url,
          isDeal: true,
        });

        dealItems[deal.id] = (deal.deal_items || [])
          .filter((item: any) => 
            typeof item.id === 'number' &&
            typeof item.deal_id === 'number' &&
            typeof item.menu_item_id === 'number' &&
            typeof item.quantity === 'number' &&
            item.menu_items &&
            typeof item.menu_items.id === 'number' &&
            typeof item.menu_items.category === 'string' &&
            typeof item.menu_items.name === 'string' &&
            typeof item.menu_items.description === 'string' &&
            typeof item.menu_items.price === 'number' &&
            typeof item.menu_items.image_url === 'string' &&
            typeof item.menu_items.is_available === 'boolean'
          )
          .map((item: any) => ({
            id: item.id,
            deal_id: item.deal_id,
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            menu_item: {
              id: item.menu_items.id,
              category: item.menu_items.category,
              name: item.menu_items.name,
              description: item.menu_items.description,
              price: item.menu_items.price,
              image_url: item.menu_items.image_url,
              is_available: item.menu_items.is_available,
            },
          }));
      }
    });

    return { deals, dealItems };
  } catch (error) {
    console.error('Error in fetchDeals:', error);
    return rejectWithValue('An unexpected error occurred while fetching deals');
  }
});

// Create the slice for handling state
const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeals.fulfilled, (state, action: PayloadAction<{ deals: Deal[]; dealItems: Record<number, DealItem[]> }>) => {
        state.loading = false;
        state.deals = action.payload.deals;
        state.dealItems = action.payload.dealItems;
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'An unknown error occurred';
      });
  },
});

export default dealsSlice.reducer;

