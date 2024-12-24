import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

interface MenuHoursModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const MenuHoursModal: React.FC<MenuHoursModalProps> = ({ isVisible, onClose }) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Menu Timings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.menuSection}>
            <Text style={[styles.menuType, { color: theme.secondary }]}>Breakfast</Text>
            <View style={styles.timeSlot}>
              <Text style={[styles.dayRange, { color: theme.text }]}>SUN-THU</Text>
              <Text style={[styles.timeRange, { color: theme.text }]}>
                6:00AM - 11:00AM <Text style={styles.lastOrder}>(Last Order 10:50AM)</Text>
              </Text>
            </View>
            <View style={styles.timeSlot}>
              <Text style={[styles.dayRange, { color: theme.text }]}>FRI-SAT</Text>
              <Text style={[styles.timeRange, { color: theme.text }]}>
                6:00AM - 12:00PM <Text style={styles.lastOrder}>(Last Order 11:50AM)</Text>
              </Text>
            </View>
          </View>

          <View style={styles.menuSection}>
            <Text style={[styles.menuType, { color: theme.secondary }]}>Regular</Text>
            <View style={styles.timeSlot}>
              <Text style={[styles.dayRange, { color: theme.text }]}>SUN-THU</Text>
              <Text style={[styles.timeRange, { color: theme.text }]}>
                11:00AM - 04:00AM <Text style={styles.lastOrder}>(Last Order 03:30AM)</Text>
              </Text>
            </View>
            <View style={styles.timeSlot}>
              <Text style={[styles.dayRange, { color: theme.text }]}>FRI-SAT</Text>
              <Text style={[styles.timeRange, { color: theme.text }]}>
                12:00PM - 04:00AM <Text style={styles.lastOrder}>(Last Order 03:30AM)</Text>
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: theme.secondary }]}
            onPress={onClose}
          >
            <Text style={[styles.doneButtonText, { color: theme.background }]}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  timeSlot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayRange: {
    fontSize: 14,
    fontWeight: '500',
    width: 80,
  },
  timeRange: {
    fontSize: 14,
    flex: 1,
    marginLeft: 16,
  },
  lastOrder: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
  },
  doneButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MenuHoursModal;