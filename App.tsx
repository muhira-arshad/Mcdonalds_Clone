import React from 'react';
import { StatusBar, Image, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { NotificationProvider } from './components/NotificationContext';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { RootState } from './store';

import HomeScreen from './screens/HomeScreen';
import MenuScreen from './screens/MenuScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import LoyaltyScreen from './screens/LoyaltyScreen';
import MoreScreen from './screens/MoreScreen';
import MapScreen from './screens/MapScreen';
import SplashScreen from './screens/SplashScreen';
import CartScreen from './screens/CartScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import DealsScreen from './screens/DealsScreen';
import ReachOutToUsScreen from './screens/ReachOutToUsScreen';
import DeliveryAddressScreen from './screens/DeliveryAddress';
import PaymentMethodScreen from './screens/PaymentMethod';
import OrderSummaryScreen from './screens/OrderSummary';
import ProfileScreen from './screens/ProfileScreen';
import FAQScreen from './screens/FAQScreen';
import TermsAndConditionsScreen from './screens/TermsAndConditionsScreen';
import RegionAndLanguageScreen from './screens/RegionLanguageScreen';
import PreSplashScreen from './screens/PreSplashScreen';
import RateUsScreen from './screens/RateUsScreen';
import OtpVerificationScreen from './components/OtpVerificationScreen';

type MainTabParamList = {
  Home: undefined;
  Menu: undefined;
  Favorites: undefined;
  Loyalty: undefined;
  Map: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  const { theme } = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text,
        tabBarStyle: { backgroundColor: theme.background },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') {
            return (
              <Image
                source={require('./assets/image-removebg-preview.png')}
                style={{ width: 23, height: 20, tintColor: color }}
              />
            );
          }
          if (route.name === 'Menu') {
            return (
              <Image
                source={require('./assets/burger-Photoroom.png')}
                style={{ width: 25, height: 25, tintColor: color }}
              />
            );
          }
          let iconName: keyof typeof MaterialIcons.glyphMap;

          switch (route.name) {
            case 'Favorites':
              iconName = 'favorite';
              break;
            case 'Loyalty':
              iconName = 'star';
              break;
            case 'Map':
              iconName = 'map';
              break;
            case 'More':
              iconName = 'more-horiz';
              break;
            default:
              iconName = 'home';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          header: () => <HomeHeader />,
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{ headerShown: false, tabBarLabel: 'Menu' }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Favorites',
          header: () => <FavoritesHeader />,
        }}
      />
      <Tab.Screen
        name="Loyalty"
        component={LoyaltyScreen}
        options={{
          tabBarLabel: 'Loyalty',
          header: () => <LoyaltyHeader />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
          header: () => <MapHeader />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          header: () => <MoreHeader />,
        }}
      />
    </Tab.Navigator>
  );
};

const Header = ({ title }: { title: string }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.header, { backgroundColor: theme.background }]}>
      <Text style={[styles.headerText, { color: theme.text }]}>{title}</Text>
      <Image
        source={require('./assets/meal-removebg-preview.png')}
        style={styles.headerImage}
      />
    </View>
  );
};

const HomeHeader = () => <Header title="Home" />;
const MoreHeader = () => <Header title="More" />;
const FavoritesHeader = () => <Header title="Favorites" />;
const LoyaltyHeader = () => <Header title="Loyalty" />;
const MapHeader = () => <Header title="Map" />;

type RootStackParamList = {
  PreSplash: undefined;
  Splash: undefined;
  MainTabs: undefined;
  Cart: undefined;
  Checkout: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OtpVerification: { email: string };
  ResetPassword: { email: string };
  Deals: undefined;
  ReachOut: undefined;
  DeliveryAddress: undefined;
  PaymentMethod: undefined;
  OrderSummary: undefined;
  Profile: undefined;
  FAQ: undefined;
  TermsAndConditions: undefined;
  RegionAndLanguage: undefined;
  ContactUs: undefined;
  Loyalty: undefined;
  RateUs: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const MainStack = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.primary },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="PreSplash"
        component={PreSplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="Deals" component={DealsScreen} />
      <Stack.Screen name="ReachOut" component={ReachOutToUsScreen} />
      <Stack.Screen name="DeliveryAddress" component={DeliveryAddressScreen} />
      <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
      <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="FAQ" component={FAQScreen} />
      <Stack.Screen name="Loyalty" component={LoyaltyScreen} />
      <Stack.Screen
        name="TermsAndConditions"
        component={TermsAndConditionsScreen}
      />
      <Stack.Screen
        name="RegionAndLanguage"
        component={RegionAndLanguageScreen}
      />
      <Stack.Screen name="RateUs" component={RateUsScreen} />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

const AppContent = () => {
  const { theme, isDarkMode } = useTheme();
  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <MainStack />
      </NavigationContainer>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 1,
    paddingHorizontal: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
});

export default App;

