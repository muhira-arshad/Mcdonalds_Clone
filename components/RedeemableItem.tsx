import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from './ThemeContext';

interface RedeemableItemProps {
  id: number;
  name: string;
  pointsCost: number;
  imageUrl: string;
  onRedeem: (id: number) => void;
  userPoints: number;
}

const RedeemableItem: React.FC<RedeemableItemProps> = ({ id, name, pointsCost, imageUrl, onRedeem, userPoints }) => {
  const { theme } = useTheme();
  const canRedeem = userPoints >= pointsCost;

  return (
    <View style={[
      styles.container, 
      { backgroundColor: theme.card },
      !canRedeem && styles.fadedContainer
    ]}>
      <Image 
        source={{ uri: imageUrl }} 
        style={[styles.image, !canRedeem && styles.fadedImage]} 
      />
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
        <Text style={[styles.points, { color: theme.text }]}>{pointsCost} points</Text>
      </View>
      <TouchableOpacity
        style={[
          styles.redeemButton,
          { backgroundColor: theme.primary },
          !canRedeem && styles.disabledButton
        ]}
        onPress={() => onRedeem(id)}
        disabled={!canRedeem}
      >
        <Text style={[styles.redeemButtonText, { color: theme.background }]}>
          Redeem
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  fadedContainer: {
    opacity: 0.5,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  fadedImage: {
    opacity: 0.7,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  points: {
    fontSize: 14,
  },
  redeemButton: {
    padding: 10,
    borderRadius: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  redeemButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RedeemableItem;

