import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { addToCart } from '../store/cartSlice';
import { fetchFavorites, toggleFavoriteOnServer, clearFavorites } from '../store/favoritesSlice';
import { supabase } from '../utils/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AddToCartModal from '../components/AddToCartModal';
import { useTheme } from '../components/ThemeContext';
import MenuHoursModal from '../components/MenuHoursModal';

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

type RootStackParamList = {
  Menu: undefined;
  Cart: undefined;
  Login: undefined;
};

type MenuScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Menu'>;

const ITEM_HEIGHT = 450; // Height of each menu item

const MenuScreen: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [localFavorites, setLocalFavorites] = useState<number[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [menuHoursVisible, setMenuHoursVisible] = useState(false); // Add state for menu hours modal

  const dispatch = useDispatch<AppDispatch>();
  const favorites = useSelector((state: RootState) => state.favorites.items);
  const user = useSelector((state: RootState) => state.auth.user);
  const navigation = useNavigation<MenuScreenNavigationProp>();
  const cartCount = useSelector((state: RootState) => state.cart.totalQuantity);

  const { theme } = useTheme();

  const flatListRef = useRef<FlatList<MenuItem>>(null);
  const categoriesListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchMenuItems();
    if (user) {
      dispatch(fetchFavorites(user.id));
    } else {
      dispatch(clearFavorites()); 
      setLocalFavorites([]); 
    }
  }, [dispatch, user]);

  useEffect(() => {
    setLocalFavorites(favorites.map(fav => fav.id));
  }, [favorites]);

  useEffect(() => {
    if (categories.length > 0 && currentCategory) {
      const initialCategoryIndex = categories.indexOf(currentCategory);
      if (initialCategoryIndex !== -1) {
        categoriesListRef.current?.scrollToIndex({
          index: initialCategoryIndex,
          animated: true,
          viewPosition: 0.5
        });
      }
    }
  }, [categories, currentCategory]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      setMenuItems(data || []);
      const uniqueCategories = Array.from(new Set(data?.map(item => item.category) || []));
      setCategories(uniqueCategories);
      if (uniqueCategories.length > 0) {
        setCurrentCategory(uniqueCategories[0]);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setError('Failed to fetch menu items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (item: MenuItem) => {
    if (user) {
      const isFavorite = localFavorites.includes(item.id);
      setLocalFavorites(prev => 
        isFavorite ? prev.filter(id => id !== item.id) : [...prev, item.id]
      );
      try {
        await dispatch(toggleFavoriteOnServer({
          userId: user.id,
          itemId: item.id,
          isFavorite: isFavorite
        })).unwrap();
      } catch (error) {
        console.error('Error toggling favorite:', error);
        Alert.alert('Error', 'Failed to update favorite. Please try again.');
        
        setLocalFavorites(prev => 
          isFavorite ? [...prev, item.id] : prev.filter(id => id !== item.id)
        );
      }
    } else {
      navigation.navigate('Login');
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={[styles.menuItem, { backgroundColor: theme.card }]}>
      <Image source={{ uri: item.image_url || undefined }} style={styles.image} />
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.itemDescription, { color: theme.text }]}>{item.description}</Text>
        <Text style={[styles.itemPrice, { color: theme.text }]}>Rs. {item.price.toFixed(2)}</Text>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => handleAddToCart(item)}
          >
            <MaterialIcons name="shopping-cart" size={20} color={theme.background} />
            <Text style={[styles.addButtonText, { color: theme.background }]}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleFavoriteToggle(item)}
            style={styles.favoriteButton}
          >
            <MaterialIcons
              name={localFavorites.includes(item.id) ? 'favorite' : 'favorite-border'}
              size={24}
              color={user ? theme.secondary : theme.text}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCategoryButton = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        { backgroundColor: theme.card },
        currentCategory === category && { backgroundColor: theme.primary },
      ]}
      onPress={() => {
        const index = menuItems.findIndex(item => item.category === category);
        if (index !== -1) {
          flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0 });
        }
      }}
    >
      <Text
        style={[
          styles.categoryButtonText,
          { color: theme.text },
          currentCategory === category && { color: theme.background },
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  const updateCurrentCategory = (offset: number) => {
    const index = Math.floor(offset / ITEM_HEIGHT);
    if (index >= 0 && index < menuItems.length) {
      const category = menuItems[index].category;
      if (category !== currentCategory) {
        setCurrentCategory(category);
        const categoryIndex = categories.indexOf(category);
        if (categoryIndex !== -1) {
          categoriesListRef.current?.scrollToIndex({
            index: categoryIndex,
            animated: true,
            viewPosition: 0.5
          });
        }
      }
    }
  };

  const getItemLayout = (_data: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  const handleScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
    updateCurrentCategory(event.nativeEvent.contentOffset.y);
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.secondary }]}>{error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={fetchMenuItems}>
          <Text style={[styles.retryButtonText, { color: theme.background }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.text === '#000000' ? "dark-content" : "light-content"} />
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>McDelivery</Text>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setMenuHoursVisible(true)}
        >
          <MaterialIcons name="schedule" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
      {!user && (
        <View style={[styles.loginPrompt, { backgroundColor: theme.card }]}>
          <Text style={[styles.loginPromptText, { color: theme.text }]}>Log in to save favorites</Text>
        </View>
      )}
      <View style={[styles.categoriesContainer, { borderBottomColor: theme.border }]}>
        <FlatList
          ref={categoriesListRef}
          data={categories}
          renderItem={({ item }) => renderCategoryButton(item)}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <FlatList
        ref={flatListRef}
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.menuList}
        getItemLayout={getItemLayout}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
      />
      <TouchableOpacity
        style={[styles.cartButton, { backgroundColor: theme.secondary }]}
        onPress={() => navigation.navigate('Cart')}
      >
        <MaterialIcons name="shopping-cart" size={26} color={theme.background} />
        <View style={[styles.badge, { backgroundColor: theme.primary }]}>
          <Text style={[styles.badgeText, { color: theme.background }]}>{cartCount}</Text>
        </View>
      </TouchableOpacity>
      {selectedItem && (
        <AddToCartModal
          isVisible={modalVisible}
          onClose={() => setModalVisible(false)}
          item={selectedItem}
        />
      )}
      <MenuHoursModal
        isVisible={menuHoursVisible}
        onClose={() => setMenuHoursVisible(false)}
      />
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
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  menuButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  loginPrompt: {
    padding: 10,
    alignItems: 'center',
  },
  loginPromptText: {
    fontSize: 14,
  },
  categoriesContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuList: {
    padding: 8,
  },
  menuItem: {
    margin: 8,
    borderRadius: 12,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
    width: '90%',
    alignSelf: 'center',
    height: ITEM_HEIGHT
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 14,
    marginVertical: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 8,
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
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  retryButton: {
    padding: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MenuScreen;