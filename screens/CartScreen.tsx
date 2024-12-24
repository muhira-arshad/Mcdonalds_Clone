import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ToastAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import {
  removeFromCart,
  updateQuantity,
  updateAddOnQuantity,
  updateCartWithImages,
} from '../store/cartSlice';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../components/ThemeContext';
import { RootState } from '../store';
import { supabase } from '../utils/supabase';

type RootStackParamList = {
  Cart: undefined;
  Checkout: undefined;
};

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Cart'>;

interface AddOn {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  isDeal?: boolean;
  addOns?: AddOn[];
}

const CartScreen: React.FC = () => {
  const { items, total } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchImagesForCartItems = async () => {
      const menuItemIds = items.filter(item => !item.isDeal).map(item => item.id);
      const dealIds = items.filter(item => item.isDeal).map(item => item.id);

      const [menuItemsData, dealsData] = await Promise.all([
        supabase.from('menu_items').select('id, image_url').in('id', menuItemIds),
        supabase.from('deals').select('id, image_url').in('id', dealIds),
      ]);

      if (menuItemsData.error) console.error('Error fetching menu item images:', menuItemsData.error);
      if (dealsData.error) console.error('Error fetching deal images:', dealsData.error);

      const combinedImageData = [...(menuItemsData.data || []), ...(dealsData.data || [])];

      const updatedItems = items.map(item => {
        const imageItem = combinedImageData.find(d => d.id === item.id);
        return { ...item, image_url: imageItem?.image_url };
      });

      dispatch(updateCartWithImages(updatedItems));
    };

    if (items.length > 0) {
      fetchImagesForCartItems();
    }
  }, [items, dispatch]);

  const increaseQuantity = (id: number, isDeal: boolean) => {
    const item = items.find(item => item.id === id && item.isDeal === isDeal);
    if (item) {
      dispatch(updateQuantity({ id, isDeal, quantity: item.quantity + 1 }));
    }
  };

  const decreaseQuantity = (id: number, isDeal: boolean) => {
    const item = items.find(item => item.id === id && item.isDeal === isDeal);
    if (item && item.quantity > 1) {
      dispatch(updateQuantity({ id, isDeal, quantity: item.quantity - 1 }));
    }
  };

  const increaseAddOnQuantity = (itemId: number, isDeal: boolean, addOnId: number) => {
    const item = items.find(item => item.id === itemId && item.isDeal === isDeal);
    const addOn = item?.addOns?.find(addOn => addOn.id === addOnId);
    if (addOn) {
      dispatch(updateAddOnQuantity({ itemId, isDeal, addOnId, quantity: addOn.quantity + 1 }));
    }
  };

  const decreaseAddOnQuantity = (itemId: number, isDeal: boolean, addOnId: number) => {
    const item = items.find(item => item.id === itemId && item.isDeal === isDeal);
    const addOn = item?.addOns?.find(addOn => addOn.id === addOnId);
    if (addOn && addOn.quantity > 0) {
      dispatch(updateAddOnQuantity({ itemId, isDeal, addOnId, quantity: addOn.quantity - 1 }));
    }
  };

  const handleRemoveItem = (id: number, isDeal: boolean) => {
    dispatch(removeFromCart({ id, isDeal }));
    const message = 'Item removed from cart';
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Toast.show({
        type: 'success',
        text1: message,
      });
    }
  };

  const renderAddOn = (itemId: number, isDeal: boolean, addOn: AddOn) => (
    <View key={addOn.id} style={styles.addOnItem}>
      <Text style={[styles.addOnName, { color: theme.text }]}>{addOn.name}</Text>
      <Text style={[styles.addOnPrice, { color: theme.text }]}>Rs. {(addOn.price * addOn.quantity).toFixed(2)}</Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          onPress={() => decreaseAddOnQuantity(itemId, isDeal, addOn.id)}
          style={[styles.quantityButton, { backgroundColor: theme.primary }]}>
          <Text style={[styles.quantityButtonText, { color: theme.background }]}>-</Text>
        </TouchableOpacity>
        <Text style={[styles.quantityText, { color: theme.text }]}>{addOn.quantity}</Text>
        <TouchableOpacity
          onPress={() => increaseAddOnQuantity(itemId, isDeal, addOn.id)}
          style={[styles.quantityButton, { backgroundColor: theme.primary }]}>
          <Text style={[styles.quantityButtonText, { color: theme.background }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={[styles.cartItem, { backgroundColor: theme.card }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.itemImage} />
        ) : (
          <ActivityIndicator size="small" color={theme.primary} />
        )}
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.itemPrice, { color: theme.text }]}>Rs. {(item.price * item.quantity).toFixed(2)}</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={() => decreaseQuantity(item.id, item.isDeal ?? false)}
              style={[styles.quantityButton, { backgroundColor: theme.primary }]}>
              <Text style={[styles.quantityButtonText, { color: theme.background }]}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.quantityText, { color: theme.text }]}>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => increaseQuantity(item.id, item.isDeal ?? false)}
              style={[styles.quantityButton, { backgroundColor: theme.primary }]}>
              <Text style={[styles.quantityButtonText, { color: theme.background }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveItem(item.id, item.isDeal ?? false)}
        style={styles.removeButton}>
        <Text style={[styles.removeButtonText, { color: theme.secondary }]}>Remove</Text>
      </TouchableOpacity>
      {item.addOns && item.addOns.length > 0 && (
        <View style={styles.addOnsContainer}>
          <Text style={[styles.addOnsTitle, { color: theme.text }]}>Add-ons:</Text>
          {item.addOns.map(addOn => renderAddOn(item.id, item.isDeal ?? false, addOn))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.text === '#FFFFFF' ? "light-content" : "dark-content"} />
      {items.length === 0 ? (
        <Text style={[styles.emptyCartText, { color: theme.text }]}>Your cart is empty</Text>
      ) : (
        <FlatList
          data={items}
          renderItem={renderCartItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
      <View style={[styles.totalContainer, { borderTopColor: theme.border }]}>
        <Text style={[styles.totalText, { color: theme.text }]}>Total: Rs. {total.toFixed(2)}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.checkoutButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('Checkout')}
          disabled={items.length === 0}>
          <Text style={[styles.checkoutButtonText, { color: theme.background }]}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyCartText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
  },
  listContent: {
    paddingBottom: 100,
  },
  cartItem: {
    margin: 10,
    borderRadius: 10,
    padding: 10,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  itemInfo: {
    marginLeft: 10,
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  removeButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    fontSize: 14,
  },
  addOnsContainer: {
    marginTop: 10,
    paddingLeft: 20,
  },
  addOnsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addOnItem: {
    marginTop: 10,
  },
  addOnName: {
    fontSize: 14,
  },
  addOnPrice: {
    fontSize: 14,
  },
  checkoutButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default CartScreen;