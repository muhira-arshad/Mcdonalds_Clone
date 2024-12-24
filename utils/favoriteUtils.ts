import { AppDispatch } from '../store';
import { toggleFavoriteOnServer, FavoriteItem } from '../store/favoritesSlice';
import { Alert } from 'react-native';

export const handleToggleFavorite = async (
  dispatch: AppDispatch,
  userId: string | null,
  item: FavoriteItem | { id: number; name: string; description?: string; price: number; image_url: string; category?: string },
  isFavorite: boolean
) => {
  if (!userId) {
    Alert.alert('Login Required', 'Please log in to manage favorites');
    return;
  }

  try {
    await dispatch(toggleFavoriteOnServer({ userId, itemId: item.id, isFavorite: !isFavorite })).unwrap();
  } catch (error) {
    console.error('Error toggling favorite:', error);
    Alert.alert('Error', 'Failed to update favorite. Please try again.');
  }
};