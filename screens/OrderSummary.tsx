import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { clearCart } from '../store/cartSlice';
import { supabase } from '../utils/supabase';
import { useTheme } from '../components/ThemeContext';

type RootStackParamList = {
  MainTabs: undefined;
  OrderSummary: undefined;
};

type OrderSummaryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OrderSummary'>;

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

export default function OrderSummaryScreen() {
  const navigation = useNavigation<OrderSummaryScreenNavigationProp>();
  const dispatch = useDispatch();
  const { items, total } = useSelector((state: RootState) => state.cart);
  const { address } = useSelector((state: RootState) => state.delivery);
  const { paymentMethod, cardDetails } = useSelector((state: RootState) => state.payment);
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);

  const handleConfirmOrder = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to place an order');
      return;
    }

    setLoading(true);

    try {
      const { data: deliveryAddress, error: deliveryError } = await supabase
        .from('delivery_addresses')
        .insert([
          {
            user_id: user.id,
            house_number: address.houseNumber,
            area: address.area,
            city: address.city,
            phone_number: address.phoneNumber,
          },
        ])
        .select('id')
        .single();

      if (deliveryError) throw deliveryError;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total_amount: total,
            status: 'Paid',
            delivery_address_id: deliveryAddress.id,
          },
        ])
        .select('id')
        .single();

      if (orderError) throw orderError;

      for (const item of items) {
        if (item.isDeal) {
          // Handle deals
          const { error: orderDealError } = await supabase
            .from('order_deals')
            .insert([
              {
                order_id: order.id,
                deal_id: item.id,
                quantity: item.quantity,
                price: item.price,
              },
            ]);

          if (orderDealError) throw orderDealError;
        } else {
          const { data: orderItem, error: orderItemError } = await supabase
            .from('order_items')
            .insert([
              {
                order_id: order.id,
                menu_item_id: item.id,
                quantity: item.quantity,
                price: item.price,
              },
            ])
            .select('id')
            .single();

          if (orderItemError) throw orderItemError;

          if (item.addOns && item.addOns.length > 0) {
            const orderItemAddOns = item.addOns.map(addOn => ({
              order_id: order.id,
              order_item_id: orderItem.id,
              menu_item_id: addOn.id,
              quantity: addOn.quantity,
              price: addOn.price,
            }));

            const { error: orderItemAddOnsError } = await supabase
              .from('order_item_add_ons')
              .insert(orderItemAddOns);

            if (orderItemAddOnsError) throw orderItemAddOnsError;
          }
        }
      }

      const { error: paymentError } = await supabase
        .from('payment_methods')
        .insert([
          {
            order_id: order.id,
            method: paymentMethod,
            card_number: paymentMethod === 'Pay with Card' ? cardDetails.cardNumber : null,
            expiration_date: paymentMethod === 'Pay with Card' ? cardDetails.expirationDate : null,
          },
        ]);

      if (paymentError) throw paymentError;

      const pointsEarned = Math.floor(total / 10);

      const { data: existingPoints, error: existingPointsError } = await supabase
        .from('loyalty_points')
        .select('points')
        .eq('user_id', user.id)
        .single();

      if (!existingPointsError && existingPoints) {
        const { error: updatePointsError } = await supabase
          .from('loyalty_points')
          .update({ points: existingPoints.points + pointsEarned })
          .eq('user_id', user.id);

        if (updatePointsError) throw updatePointsError;
      } else {
        const { error: insertPointsError } = await supabase
          .from('loyalty_points')
          .insert([{ user_id: user.id, points: pointsEarned }]);

        if (insertPointsError) throw insertPointsError;
      }

      const { error: loyaltyTransactionError } = await supabase
        .from('loyalty_transactions')
        .insert([
          {
            user_id: user.id,
            points_change: pointsEarned,
            transaction_type: 'earn',
            order_id: order.id,
          },
        ]);

      if (loyaltyTransactionError) throw loyaltyTransactionError;
      dispatch(clearCart());

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'MainTabs',
              state: {
                routes: [{ name: 'Home' }],
                index: 0,
              },
            },
          ],
        })
      );

      setTimeout(() => {
        Alert.alert('Order Confirmed', 'Your order has been confirmed!');
      }, 100);

    } catch (error) {
      console.error('Error confirming order:', error);
      Alert.alert('Error', 'There was an error confirming your order. Please try again.');
    } finally {
      setLoading(false);
    }
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.text === '#000000' ? "dark-content" : "light-content"} />
      <ScrollView>
        <Text style={[styles.title, { color: theme.text }]}>Order Summary</Text>

        <View style={[styles.section, { borderBottomColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Items:</Text>
          {items.map((item: CartItem) => (
            <View key={item.id} style={styles.itemContainer}>
              <View style={styles.item}>
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
          ))}
          <Text style={[styles.total, { color: theme.text }]}>Total: Rs. {total.toFixed(2)}</Text>
        </View>

        <View style={[styles.section, { borderBottomColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Delivery Address:</Text>
          <Text style={[styles.addressText, { color: theme.text }]}>
            {`${address.houseNumber}, ${address.area}, ${address.city}`}
          </Text>
          <Text style={[styles.addressText, { color: theme.text }]}>Contact: {address.phoneNumber}</Text>
        </View>

        <View style={[styles.section, { borderBottomColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Method:</Text>
          <Text style={[styles.paymentText, { color: theme.text }]}>
            {paymentMethod === 'Cash on Delivery'
              ? 'Cash on Delivery'
              : `Card ending in ${cardDetails.cardNumber.slice(-4)}`}
          </Text>
          {paymentMethod !== 'Cash on Delivery' && (
            <Text style={[styles.paymentText, { color: theme.text }]}>Expiration: {cardDetails.expirationDate}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.disabledButton, { backgroundColor: theme.primary }]}
          onPress={handleConfirmOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.background} />
          ) : (
            <Text style={[styles.confirmButtonText, { color: theme.background }]}>Confirm Order</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  section: {
    marginBottom: 20,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemContainer: {
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  itemName: {
    flex: 2,
    fontSize: 16,
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
  },
  addOnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
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
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'right',
  },
  addressText: {
    fontSize: 16,
    marginBottom: 5,
  },
  paymentText: {
    fontSize: 16,
    marginBottom: 5,
  },
  confirmButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});