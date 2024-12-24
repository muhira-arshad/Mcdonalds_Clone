import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../store';
import { useTheme } from '../components/ThemeContext';

type RootStackParamList = {
  Checkout: undefined;
  DeliveryAddress: undefined;
  Home: undefined;
  Login: undefined;
};

type CheckoutScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Checkout'>;

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
  isDeal: boolean;
  addOns?: AddOn[];
}

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const { items, total } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (!user) {
      navigation.navigate('Login');
    }
  }, [user, navigation]);

  const handleConfirm = () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to complete your order');
      navigation.navigate('Login');
      return;
    }

    navigation.navigate('DeliveryAddress');
  };

  const renderAddOns = (addOns: AddOn[]) => {
    return addOns.map((addOn) => (
      <View key={addOn.id} style={styles.addOnItem}>
        <Text style={[styles.addOnName, { color: theme.text }]}>- {addOn.name}</Text>
        <Text style={[styles.addOnQuantity, { color: theme.text }]}>x{addOn.quantity}</Text>
        <Text style={[styles.addOnPrice, { color: theme.text }]}>Rs. {(addOn.price * addOn.quantity).toFixed(2)}</Text>
      </View>
    ));
  };

  const renderCartItem = (item: CartItem) => (
    <View key={`${item.id}-${item.isDeal}`} style={[styles.item, { borderBottomColor: theme.border }]}>
      <View style={styles.itemHeader}>
        <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.itemQuantity, { color: theme.text }]}>x{item.quantity}</Text>
        <Text style={[styles.itemPrice, { color: theme.text }]}>Rs. {(item.price * item.quantity).toFixed(2)}</Text>
      </View>
      {item.addOns && item.addOns.length > 0 && (
        <View style={styles.addOnsContainer}>
          {renderAddOns(item.addOns)}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.text === '#000000' ? "dark-content" : "light-content"} />
      <ScrollView>
        <Text style={[styles.title, { color: theme.text }]}>Checkout</Text>
        {items.map(renderCartItem)}
        <View style={[styles.totalContainer, { borderTopColor: theme.border }]}>
          <Text style={[styles.totalText, { color: theme.text }]}>Total:</Text>
          <Text style={[styles.totalAmount, { color: theme.text }]}>Rs. {total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleConfirm}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : 'Confirm'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    marginBottom: 15,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    flex: 2,
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemQuantity: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
  },
  itemPrice: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
  },
  addOnsContainer: {
    marginLeft: 20,
    marginTop: 5,
  },
  addOnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  addOnName: {
    flex: 2,
    fontSize: 14,
  },
  addOnQuantity: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  addOnPrice: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#ffbc0d',
    paddingVertical: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default CheckoutScreen;