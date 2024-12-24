import React, { useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, RefreshControl, SafeAreaView, StatusBar, ToastAndroid, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchFavorites, FavoriteItem, toggleFavoriteOnServer } from '../store/favoritesSlice';
import { addToCart } from '../store/cartSlice';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../components/ThemeContext';

type RootStackParamList = {
  Favorites: undefined;
  Cart: undefined;
  Login: { redirect: 'Favorites' };
};

type FavoritesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Favorites'>;

const FavoritesScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const favorites = useSelector((state: RootState) => state.favorites.items);
  const cartCount = useSelector((state: RootState) => state.cart.totalQuantity);
  const loading = useSelector((state: RootState) => state.favorites.loading);
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const { theme } = useTheme();

  const loadFavorites = useCallback(() => {
    if (user) {
      dispatch(fetchFavorites(user.id));
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      navigation.replace('Login', { redirect: 'Favorites' });
    }
  }, [user, navigation, loadFavorites]);

  const handleAddToCart = (item: FavoriteItem) => {
    dispatch(addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image_url: item.image_url,
      isDeal: false
    }));

    const message = `${item.name} has been added to your cart`;
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

  const handleFavoriteToggle = (item: FavoriteItem) => {
    if (user) {
      dispatch(toggleFavoriteOnServer({ userId: user.id, itemId: item.id, isFavorite: item.isFavorite }));
    }
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteItem }) => (
    <View style={[styles.favoriteItem, { backgroundColor: theme.card }]}>
      {item.image_url && <Image source={{ uri: item.image_url }} style={styles.itemImage} />}
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
        {item.description && <Text style={[styles.itemDescription, { color: theme.text }]}>{item.description}</Text>}
        {item.price !== undefined ? (
          <Text style={[styles.itemPrice, { color: theme.primary }]}>Rs. {item.price.toFixed(2)}</Text>
        ) : (
          <Text style={[styles.itemPrice, { color: theme.primary }]}>Price not available</Text>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => handleAddToCart(item)}
          disabled={item.price === undefined}
        >
          <MaterialIcons name="add-shopping-cart" size={18} color={theme.background} style={{ marginRight: 5 }} />
          <Text style={[styles.buttonText, { color: theme.background }]}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleFavoriteToggle(item)}
        >
          <MaterialIcons
            name={item.isFavorite ? "favorite" : "favorite-border"}
            size={24}
            color={item.isFavorite ? theme.secondary : theme.text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.text === '#FFFFFF' ? "light-content" : "dark-content"} />
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={[styles.headerTitle, { color: theme.background }]}>Your Favorites</Text>
      </View>
      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={favorites.length === 0 ? styles.emptyList : undefined}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadFavorites}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              You haven't added any favorites yet.
            </Text>
            <Text style={[styles.pullToRefreshText, { color: theme.text }]}>
              Pull down to refresh
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        style={[styles.cartButton, { backgroundColor: theme.secondary }]}
        onPress={() => navigation.navigate('Cart')}
      >
        <MaterialIcons name="shopping-cart" size={24} color={theme.background} />
        <View style={[styles.badge, { backgroundColor: theme.primary }]}>
          <Text style={[styles.badgeText, { color: theme.background }]}>{cartCount}</Text>
        </View>
      </TouchableOpacity>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  favoriteItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  favoriteButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  pullToRefreshText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default FavoritesScreen;

