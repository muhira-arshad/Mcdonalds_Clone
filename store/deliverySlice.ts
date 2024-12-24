import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DeliveryAddress {
  houseNumber: string;
  area: string;
  city: string;
  phoneNumber: string;
}

interface DeliveryState {
  address: DeliveryAddress;
}

const initialState: DeliveryState = {
  address: {
    houseNumber: '',
    area: '',
    city: '',
    phoneNumber: '',
  },
};

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    setDeliveryAddress: (state, action: PayloadAction<DeliveryAddress>) => {
      state.address = action.payload;
    },
  },
});

export const { setDeliveryAddress } = deliverySlice.actions;
export default deliverySlice.reducer;