import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CardDetails {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
}

interface PaymentState {
  paymentMethod: 'Cash on Delivery' | 'Pay with Card';
  cardDetails: CardDetails;
}

const initialState: PaymentState = {
  paymentMethod: 'Cash on Delivery',
  cardDetails: {
    cardNumber: '',
    expirationDate: '',
    cvv: '',
  },
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentMethod: (state, action: PayloadAction<'Cash on Delivery' | 'Pay with Card'>) => {
      state.paymentMethod = action.payload;
    },
    setCardDetails: (state, action: PayloadAction<CardDetails>) => {
      state.cardDetails = action.payload;
    },
  },
});

export const { setPaymentMethod, setCardDetails } = paymentSlice.actions;
export default paymentSlice.reducer;