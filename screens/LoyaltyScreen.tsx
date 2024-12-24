import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, RefreshControl, SafeAreaView, StatusBar } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { supabase } from '../utils/supabase';
import { setPoints } from '../store/loyaltySlice';
import { addLoyaltyItemToCart } from '../store/cartSlice';
import { useTheme } from '../components/ThemeContext';
import RedeemableItem from '../components/RedeemableItem';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
}

export default function LoyaltyScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { points } = useSelector((state: RootState) => state.loyalty);
  const dispatch = useDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [redeemableItems, setRedeemableItems] = useState<MenuItem[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    if (user) {
      fetchLoyaltyPoints();
      fetchRedeemableItems();
    }
  }, [user]);

  const fetchLoyaltyPoints = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to view your loyalty points');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('points')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          dispatch(setPoints(0));
        } else {
          console.error('Error fetching loyalty points:', error);
          Alert.alert('Error', 'Unable to fetch loyalty points. Please try again later.');
        }
        return;
      }

      dispatch(setPoints(data?.points ?? 0));

    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred while fetching loyalty points.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchRedeemableItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, price, image_url')
        .eq('is_available', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching redeemable items:', error);
        Alert.alert('Error', 'Unable to fetch redeemable items. Please try again later.');
        return;
      }

      setRedeemableItems(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred while fetching redeemable items.');
    }
  };

  const handleRedeem = async (itemId: number) => {
    if (!user) {
      Alert.alert('Error', 'Please log in to redeem points');
      return;
    }

    const item = redeemableItems.find(item => item.id === itemId);
    if (!item) {
      Alert.alert('Error', 'Item not found');
      return;
    }

    const pointsCost = Math.round(item.price * 5); // Convert price to points (1 point = 0.1 Rs)

    if (points < pointsCost) {
      Alert.alert('Error', 'Not enough points to redeem this item');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('redeem_points', {
        p_user_id: user.id,
        p_points_to_redeem: pointsCost,
        p_menu_item_id: itemId
      });

      if (error) {
        console.error('Error redeeming points:', error);
        Alert.alert('Error', `Unable to redeem points: ${error.message}`);
        return;
      }

      // Update local state
      dispatch(setPoints(points - pointsCost));

      // Add the redeemed item to the cart
      dispatch(addLoyaltyItemToCart({
        id: item.id,
        item_name: item.name,
        points_required: pointsCost,
        description: '', // Add description if available
        image_url: item.image_url
      }));

      Alert.alert('Success', `You've successfully redeemed ${item.name}! It has been added to your cart.`);

      // Refresh the loyalty points and redeemable items
      fetchLoyaltyPoints();
      fetchRedeemableItems();

    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred while redeeming points.');
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchLoyaltyPoints();
    fetchRedeemableItems();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.text === '#FFFFFF' ? "light-content" : "dark-content"} />
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[theme.primary]} />}
      >
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Text style={[styles.title, { color: theme.background }]}>McDonald's Loyalty Program</Text>
          {user ? (
            <Text style={[styles.pointsText, { color: theme.background }]}>Your Points: {points !== null ? points : 'Loading...'}</Text>
          ) : (
            <Text style={[styles.pointsText, { color: theme.background }]}>Log in to view loyalty points</Text>
          )}
        </View>
        <View style={[styles.infoSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>How to Earn Points</Text>
          <Text style={[styles.infoText, { color: theme.text }]}>
            • Earn 1 point for every 10 Rs spent on your orders{'\n'}
            • Get bonus points for trying new menu items{'\n'}
            • Participate in special promotions for extra points
          </Text>
        </View>
        <View style={[styles.infoSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>Redeem Your Points</Text>
          {redeemableItems.map((item) => (
            <RedeemableItem
              key={item.id}
              id={item.id}
              name={item.name}
              pointsCost={Math.round(item.price * 10)}
              imageUrl={item.image_url}
              onRedeem={handleRedeem}
              userPoints={points}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSection: {
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

