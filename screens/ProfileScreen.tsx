import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Alert, SafeAreaView, StatusBar } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { supabase } from '../utils/supabase';
import { setPoints } from '../store/loyaltySlice';
import { useTheme } from '../components/ThemeContext';

type RootStackParamList = {
  MainTabs: { screen: 'Home' | 'Menu' | 'Loyalty' };
  Menu: undefined;
  Login: undefined;
  Profile: undefined;
  Loyalty: undefined;
};

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface Order {
  id: number;
  created_at: string;
  total_amount: number;
  status: string;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { points } = useSelector((state: RootState) => state.loyalty);
  const dispatch = useDispatch();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();

  const fetchLoyaltyPoints = useCallback(async () => {
    if (!user) return;

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
          throw error;
        }
      } else {
        dispatch(setPoints(data?.points || 0));
      }
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
      Alert.alert('Error', 'Unable to fetch loyalty points. Please try again later.');
    }
  }, [user, dispatch]);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to fetch orders. Please try again.');
    }
  }, [user, navigation]);

  useEffect(() => {
    fetchOrders();
    fetchLoyaltyPoints();
  }, [fetchOrders, fetchLoyaltyPoints]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      dispatch(logout());
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { screen: 'Menu' } }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    await fetchLoyaltyPoints();
    setRefreshing(false);
  }, [fetchOrders, fetchLoyaltyPoints]);

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={[styles.orderItem, { backgroundColor: theme.card }]}>
      <Text style={[styles.orderDate, { color: theme.text }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
      <Text style={[styles.orderTotal, { color: theme.text }]}>Total: Rs. {item.total_amount.toFixed(2)}</Text>
      <Text style={[styles.orderStatus, { color: theme.text }]}>Status: {item.status}</Text>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={theme.text === '#000000' ? "dark-content" : "light-content"} />
        <Text style={[styles.title, { color: theme.text }]}>Please log in to view your profile</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.buttonText, { color: theme.background }]}>Log In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.text === '#000000' ? "dark-content" : "light-content"} />
      <Text style={[styles.title, { color: theme.primary }]}>Profile</Text>
      <Text style={[styles.email, { color: theme.text }]}>{user.email}</Text>
      <Text style={[styles.points, { color: theme.text }]}>Loyalty Points: {points}</Text>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('Loyalty')}>
        <Text style={[styles.buttonText, { color: theme.background }]}>View Loyalty Program</Text>
      </TouchableOpacity>
      <Text style={[styles.ordersTitle, { color: theme.primary }]}>Order History</Text>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.orderList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }
        ListEmptyComponent={
          <Text style={[styles.emptyListText, { color: theme.text }]}>No orders found</Text>
        }
      />
      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.primary }]} onPress={handleLogout}>
        <Text style={[styles.logoutButtonText, { color: theme.secondary }]}>Logout</Text>
      </TouchableOpacity>
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
    marginBottom: 10,
  },
  email: {
    fontSize: 18,
    marginBottom: 10,
  },
  points: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  ordersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  orderList: {
    flex: 1,
  },
  orderItem: {
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  orderDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderTotal: {
    fontSize: 16,
  },
  orderStatus: {
    fontSize: 16,
  },
  logoutButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  logoutButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default ProfileScreen;