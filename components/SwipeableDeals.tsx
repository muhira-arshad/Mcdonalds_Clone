import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState } from '../store';
import { Deal } from '../store/dealSlice';
import { useTheme } from './ThemeContext';
import { fetchDeals } from '../store/dealSlice';
import { AppDispatch } from '../store';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Deals: { selectedDealId?: number };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'Deals'>;

const SwipeableDeals: React.FC = () => {
  const { deals } = useSelector((state: RootState) => state.deals);
  const [activeIndex, setActiveIndex] = useState(0);
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const swiperRef = useRef<Swiper | null>(null);
  const autoplayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    dispatch(fetchDeals());
  }, [dispatch]);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, []);

  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimeoutRef.current = setTimeout(() => {
      if (swiperRef.current) {
        swiperRef.current.scrollBy(1);
      }
      startAutoplay();
    }, 5000);
  };

  const stopAutoplay = () => {
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
    }
  };

  const handleIndexChanged = (index: number) => {
    setActiveIndex(index);
    startAutoplay();
  };

  const handleDealPress = (deal: Deal) => {
    navigation.navigate('Deals', { selectedDealId: deal.id });
  };

  if (deals.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Hot Deals</Text>
      <Swiper
        ref={swiperRef}
        style={styles.wrapper}
        showsPagination={true}
        loop={true}
        onIndexChanged={handleIndexChanged}
        onTouchStart={stopAutoplay}
        onTouchEnd={startAutoplay}
        paginationStyle={styles.pagination}
        dotStyle={styles.dot}
        activeDotStyle={[styles.activeDot, { backgroundColor: theme.primary }]}
      >
        {deals.map((deal: Deal) => (
          <TouchableOpacity key={deal.id} style={styles.slide} onPress={() => handleDealPress(deal)}>
            <View style={[styles.dealItem, { backgroundColor: theme.card }]}>
              <Image source={{ uri: deal.image_url }} style={styles.dealImage} />
              <View style={styles.priceBadge}>
                <Text style={styles.discountedPrice}>
                  Rs. {deal.discounted_price.toFixed(2)}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountPercentage}>
                    {deal.discount_percentage.toFixed(0)}%
                  </Text>
                  <Text style={styles.discountPercentage}>
                    OFF
                  </Text>
                </View>
              </View>
              <View style={styles.dealInfo}>
                <View style={styles.textContainer}>
                  <Text style={[styles.dealTitle, { color: theme.text }]}>{deal.name}</Text>
                  <Text style={[styles.dealDescription, { color: theme.text }]} numberOfLines={2}>{deal.description}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    marginBottom: 20,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  wrapper: {
    height: 270,
  },
  slide: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dealItem: {
    width: width -40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    height: 250,
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
    paddingHorizontal: 10,
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dealDescription: {
    fontSize: 14,
  },
  pagination: {
    bottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginLeft: 3,
    marginRight: 3,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
  },
});

export default SwipeableDeals;

