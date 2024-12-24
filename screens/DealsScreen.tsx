import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator, TouchableOpacity, ToastAndroid, Platform, SafeAreaView, StatusBar } from 'react-native';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeals } from '../store/dealSlice';
import { RootState, AppDispatch } from '../store';
import { Deal } from '../store/dealSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { addToCart } from '../store/cartSlice';
import { useTheme } from '../components/ThemeContext';

type RootStackParamList = {
  Deals: { selectedDealId?: number };
  Cart: undefined;
};

type DealsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Deals'>;

const DealsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { deals, loading, error } = useSelector((state: RootState) => state.deals);
  const navigation = useNavigation<DealsScreenNavigationProp>();
  const route = useRoute();
  const cartCount = useSelector((state: RootState) => state.cart.totalQuantity);
  const { theme } = useTheme();
  const [selectedDealId, setSelectedDealId] = useState<number | undefined>(
    (route.params as { selectedDealId?: number })?.selectedDealId
  );

  const flatListRef = useRef<FlatList<Deal>>(null);

  useEffect(() => {
    dispatch(fetchDeals());
  }, [dispatch]);

  useEffect(() => {
    if (selectedDealId && flatListRef.current && deals.length > 0) {
      const selectedDealIndex = deals.findIndex(deal => deal.id === selectedDealId);
      if (selectedDealIndex !== -1) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: selectedDealIndex, animated: true, viewPosition: 0.5 });
        }, 100);
      }
    }
  }, [selectedDealId, deals]);

  const handleAddToCart = (deal: Deal) => {
    const cartItem = {
      id: deal.id,
      name: deal.name,
      price: deal.discounted_price,
      quantity: 1,
      image_url: deal.image_url,
      isDeal: true,
    };
    dispatch(addToCart(cartItem));

    const message = `${deal.name} has been added to your cart`;
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: message,
      });
    }
  };

  const renderDealItem = ({ item }: { item: Deal }) => (
    <View style={[styles.dealItem, { backgroundColor: theme.card }]}>
      <Image source={{ uri: item.image_url }} style={styles.dealImage} />
      <View style={styles.priceBadge}>
        <Text style={styles.discountedPrice}>
          Rs. {item.discounted_price.toFixed(2)}
        </Text>
        <View style={styles.discountBadge}>
          <Text style={styles.discountPercentage}>
            {item.discount_percentage.toFixed(0)}%
          </Text>
          <Text style={styles.discountPercentage}>
            OFF
          </Text>
        </View>
      </View>
      <View style={styles.dealInfo}>
        <View style={styles.textContainer}>
          <Text style={[styles.dealTitle, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.dealDescription, { color: theme.text }]}>{item.description}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleAddToCart(item)}
          style={styles.addToCartButton}
        >
          <MaterialIcons name="add-shopping-cart" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: 270,
      offset: 270 * index,
      index,
    }),
    []
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#ffbc0d" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.text === '#000000' ? "dark-content" : "light-content"} />
      <Text style={[styles.title, { color: theme.text }]}>Current Deals</Text>
      {deals.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.text }]}>No deals available at the moment.</Text>
      ) : (
        <FlatList
          ref={flatListRef}
          data={deals}
          renderItem={renderDealItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.text }]}>No deals found.</Text>}
          getItemLayout={getItemLayout}
          initialNumToRender={10}
        />
      )}

      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => navigation.navigate('Cart')}
      >
        <MaterialIcons name="shopping-cart" size={28} color="white" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cartCount}</Text>
        </View>
      </TouchableOpacity>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  dealItem: {
    margin: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    height: 270
  },
  dealImage: {
    width: '70%',
    height: 150,
    borderTopLeftRadius: 10,
  },
  priceBadge: {
    position: 'absolute',
    right: 0,
    width: 120,
    backgroundColor: '#FFC72C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    height: 150,
    borderTopRightRadius: 10,
  },
  discountedPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  discountBadge: {
    backgroundColor: 'white',
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginLeft: 20,
  },
  discountPercentage: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#27251F',
  },
  dealInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
    paddingLeft: 10,
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dealDescription: {
    fontSize: 14,
  },
  addToCartButton: {
    backgroundColor: '#DA291C',
    padding: 8,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    width: 50,
    height: 50
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#DA291C',
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
    backgroundColor: '#FFC72C',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#27251F',
    fontSize: 14,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
  },
});

export default DealsScreen;

