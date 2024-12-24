import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../components/ThemeContext';
import { useNotification } from '../components/NotificationContext';
import SwipeableDeals from '../components/SwipeableDeals';

type RootStackParamList = {
  Home: undefined;
  Deals: { selectedDealId?: number };
  Loyalty: undefined;
  Favorites: undefined;
  ReachOut: undefined;
  Cart: undefined;
  Map: undefined;
  RateUs: undefined;
};

type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const cartCount = useSelector((state: RootState) => state.cart.totalQuantity);
  const { theme } = useTheme();
  const { notification, hideNotification } = useNotification();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification, hideNotification]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>

        <SwipeableDeals />

        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Favorites')}
            accessibilityLabel="Navigate to Favorites"
          >
            <View style={styles.cardContent}>
              <Image
                source={{ uri: 'https://www.mashed.com/img/gallery/mcdonalds-menu-items-that-are-only-available-outside-the-us/intro-1675200060.jpg' }}
                style={styles.cardImage}
              />
              <Text style={[styles.cardTitle, { color: theme.text }]}>Favorites</Text>
              <Text style={[styles.cardSubtitle, { color: theme.text }]}>Your saved menu items</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Loyalty')}
            accessibilityLabel="Navigate to Loyalty Program"
          >
            <View style={styles.cardContent}>
              <Image
                source={{ uri: 'https://s7d1.scene7.com/is/image/mcdonalds/download-the-mcdonalds-app-rewards-3columnpb:3-column-desktop?resmode=sharp2' }}
                style={styles.cardImage}
              />
              <Text style={[styles.cardTitle, { color: theme.text }]}>Loyalty Program</Text>
              <Text style={[styles.cardSubtitle, { color: theme.text }]}>Earn points with every order</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Deals', {})}
            accessibilityLabel="Navigate to Deals"
          >
            <View style={styles.cardContent}>
              <Image
                source={{ uri: 'https://www.foodandwine.com/thmb/L7IGTIa5v8ZwOpjsKDLt2g-WpEA=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/McDonalds-extending-5-deal-FT-BLOG0924-02-a9dbe0059fa246abbaaba064fc0443f8.jpg' }}
                style={styles.cardImage}
              />
              <Text style={[styles.cardTitle, { color: theme.text }]}>Deals</Text>
              <Text style={[styles.cardSubtitle, { color: theme.text }]}>Exclusive offers just for you</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('ReachOut')}
            accessibilityLabel="Navigate to Reach Out to Us"
          >
            <View style={styles.cardContent}>
              <Image
                source={{ uri: 'https://www.mcdonalds.com.my/images/booking_system/contact.png' }}
                style={styles.reachOutImage}
              />
              <Text style={[styles.cardTitle, { color: theme.text }]}>Reach Out to Us</Text>
              <Text style={[styles.cardSubtitle, { color: theme.text }]}>We're here to help</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('RateUs')}
            accessibilityLabel="Navigate to Rate Us"
          >
            <View style={styles.cardContent}>
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1484/1484560.png' }}
                style={styles.cardImage}
              />
              <Text style={[styles.cardTitle, { color: theme.text }]}>Rate Us</Text>
              <Text style={[styles.cardSubtitle, { color: theme.text }]}>Share your experience</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {cartCount > 0 && (
        <TouchableOpacity
          style={[styles.cartButton, { backgroundColor: theme.secondary }]}
          onPress={() => navigation.navigate('Cart')}
          accessibilityLabel="Go to Cart"
        >
          <MaterialIcons name="shopping-cart" size={24} color={theme.text} />
          <View style={[styles.badge, { backgroundColor: theme.primary }]}>
            <Text style={[styles.badgeText, { color: theme.text }]}>{cartCount}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  bannerContainer: {
    marginBottom: 10,
  },
  bannerImage: {
    width: '100%',
    height: 400,
  },
  cardsContainer: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    marginBottom: 10,
    marginHorizontal: 10,
  },
  card: {
    width: '95%',
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 400,
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  cardImage: {
    width: '90%',
    height: 200,
    marginBottom: 20,
    borderRadius: 8,
  },
  reachOutImage: {
    width: 150,
    height: 180,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  cardTitle: {
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HomeScreen;

