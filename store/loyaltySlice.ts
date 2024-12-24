import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoyaltyState {
  points: number;
}

const initialState: LoyaltyState = {
  points: 0,
};

const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState,
  reducers: {
    addPoints: (state, action: PayloadAction<number>) => {
      state.points += action.payload;
    },
    usePoints: (state, action: PayloadAction<number>) => {
      state.points = Math.max(0, state.points - action.payload);
    },
    setPoints: (state, action: PayloadAction<number>) => {
      state.points = action.payload;
    },
  },
});

export const { addPoints, usePoints, setPoints } = loyaltySlice.actions;
export default loyaltySlice.reducer;