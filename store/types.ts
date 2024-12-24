import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Add this import

export type RootStackParamList = {
  PreSplash: undefined; // Added this line
  Splash: undefined;
  Home: undefined;
  MainTabs: undefined;
  Cart: undefined;
  Checkout: undefined;
  Login: undefined;
  Register: undefined;
  DeliveryAddress: undefined;
  PaymentMethod: undefined;
  OrderSummary: undefined;
  FAQ: undefined;
  TermsAndConditions: undefined;
  RegionAndLanguage: undefined;
  ContactUs: undefined;
  More: undefined;
  Map: undefined;
};

// Navigation Prop Types
export type NavigationProp<T extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, T>;