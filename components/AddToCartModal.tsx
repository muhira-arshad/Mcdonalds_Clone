import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { supabase } from '../utils/supabase';
import { MenuItem } from '../screens/MenuScreen';
import { Feather } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

interface AddToCartModalProps {
  isVisible: boolean;
  onClose: () => void;
  item: MenuItem;
}

interface AddOn {
  id: number;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({ isVisible, onClose, item }) => {
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const dispatch = useDispatch();
  const { theme } = useTheme();

  useEffect(() => {
    fetchAddOns();
  }, []);

  const fetchAddOns = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, name, price, category')
      .in('category', ['Sides', 'Beverages', 'McCafe', 'Desserts', 'Salads'])
      .eq('is_available', true);

    if (error) {
      console.error('Error fetching add-ons:', error);
    } else {
      setAddOns(data?.map(addOn => ({ ...addOn, quantity: 1 })) || []);
    }
  };

  const toggleAddOn = (addOn: AddOn) => {
    setSelectedAddOns(prev =>
      prev.some(item => item.id === addOn.id)
        ? prev.filter(item => item.id !== addOn.id)
        : [...prev, addOn]
    );
  };

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image_url: item.image_url || '',
      isDeal: false,
      addOns: selectedAddOns
    }));
    setSelectedAddOns([]);
    onClose();
  };

  const renderAddOn = ({ item: addOn }: { item: AddOn }) => {
    const isSelected = selectedAddOns.some(item => item.id === addOn.id);
    return (
      <TouchableOpacity
        style={[styles.addOnItem, { backgroundColor: theme.card }]}
        onPress={() => toggleAddOn(addOn)}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Feather name="check" size={16} color="white" />}
        </View>
        <Text style={[styles.addOnName, { color: theme.text }]}>{addOn.name}</Text>
        <Text style={[styles.addOnPrice, { color: theme.text }]}>Rs. {addOn.price.toFixed(2)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.modalDescription, { color: theme.text }]}>{item.description}</Text>
          <Text style={[styles.modalPrice, { color: theme.text }]}>Rs. {item.price.toFixed(2)}</Text>

          <Text style={[styles.addOnsTitle, { color: theme.text }]}>Add-ons</Text>
          <FlatList
            data={addOns}
            renderItem={renderAddOn}
            keyExtractor={(addOn) => addOn.id.toString()}
            style={styles.addOnsList}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.border }]} onPress={onClose}>
              <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
              <Text style={styles.buttonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addOnsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  addOnsList: {
    maxHeight: 200,
  },
  addOnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffbc0d',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#ffbc0d',
  },
  addOnName: {
    fontSize: 16,
    flex: 1,
  },
  addOnPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#ffbc0d',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddToCartModal;