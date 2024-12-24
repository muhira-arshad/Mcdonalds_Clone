import { combineReducers } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import favoritesReducer from './favoritesSlice';
import loyaltyReducer from './loyaltySlice';
import offlineReducer from './offlineSlice';
import authReducer from './authSlice';
import dealsReducer from './dealSlice';
import deliveryReducer from './deliverySlice';
import paymentReducer from './paymentSlice';

const rootReducer = combineReducers({
  cart: cartReducer,
  favorites: favoritesReducer,
  loyalty: loyaltyReducer,
  offline: offlineReducer,
  auth: authReducer,
  deals: dealsReducer,
  delivery: deliveryReducer,
  payment: paymentReducer,
});

export default rootReducer;