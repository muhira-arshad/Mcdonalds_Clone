import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../components/ThemeContext';


type MoreScreenNavigationProp = StackNavigationProp<any, 'More'>;

type MenuItem = {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
};

const MoreScreen: React.FC = () => {
  const navigation = useNavigation<MoreScreenNavigationProp>();
  const { theme, toggleTheme } = useTheme();

  const isDarkMode = theme.background === '#121212';

  const menuItems: MenuItem[] = [
    {
      title: 'Profile',
      icon: 'person',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      title: 'Deals',
      icon: 'local-offer',
      onPress: () => navigation.navigate('Deals'),
    },
    {
      title: 'Reach Out to Us',
      icon: 'contact-support',
      onPress: () => navigation.navigate('ReachOut'),
    },
    {
      title: 'FAQ',
      icon: 'help',
      onPress: () => navigation.navigate('FAQ'),
    },
    {
      title: 'Terms and Conditions',
      icon: 'description',
      onPress: () => navigation.navigate('TermsAndConditions'),
    },
    {
      title: 'Region and Language',
      icon: 'language',
      onPress: () => navigation.navigate('RegionAndLanguage'),
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    menuItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    menuIcon: {
      marginRight: 12,
    },
    menuItemText: {
      fontSize: 16,
      color: theme.text,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    switchText: {
      fontSize: 16,
      color: theme.text,
    },
  });

  return (
    <ScrollView style={styles.container}>
      {menuItems.map((item, index) => (
        <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
          <View style={styles.menuItemContent}>
            <MaterialIcons name={item.icon} size={24} color={theme.text} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>{item.title}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.text} />
        </TouchableOpacity>
      ))}
      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{ false: "#767577", true: theme.primary }}
          thumbColor={isDarkMode ? theme.secondary : "#f4f3f4"}
        />
      </View>
    </ScrollView>
  );
};

export default MoreScreen;