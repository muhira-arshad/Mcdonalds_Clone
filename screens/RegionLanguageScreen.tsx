import { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useTheme } from '../components/ThemeContext';

interface Option {
  value: string;
  label: string;
}

export default function RegionAndLanguageScreen() {
  const [regionOpen, setRegionOpen] = useState(false);
  const [region, setRegion] = useState<string | null>(null);
  const [regionItems, setRegionItems] = useState<Option[]>([
    { value: 'pk', label: 'Pakistan' },
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'au', label: 'Australia' },
  ]);

  const [languageOpen, setLanguageOpen] = useState(false);
  const [language, setLanguage] = useState<string | null>(null);
  const [languageItems, setLanguageItems] = useState<Option[]>([
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
  ]);

  const { theme } = useTheme();

  const handleSave = () => {
    if (region && language) {
      Alert.alert('Settings Saved', ` Region: ${region}, Language: ${language}`);
    } else {
      Alert.alert('Error', 'Please select both region and language');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.text === '#000000' ? "dark-content" : "light-content"} />
      <Text style={[styles.title, { color: theme.primary }]}>Region and Language</Text>

      <Text style={[styles.label, { color: theme.text }]}>Select Region:</Text>
      <DropDownPicker
        open={regionOpen}
        value={region}
        items={regionItems}
        setOpen={setRegionOpen}
        setValue={setRegion}
        setItems={setRegionItems}
        placeholder="Select a region"
        style={[styles.dropdown, { backgroundColor: theme.input }]}
        textStyle={{ color: theme.text }}
        dropDownContainerStyle={[styles.dropdownContainer, { backgroundColor: theme.input }]}
        placeholderStyle={{ color: theme.placeholder }}
        zIndex={3000}
        zIndexInverse={1000}
      />

      <Text style={[styles.label, { color: theme.text }]}>Select Language:</Text>
      <DropDownPicker
        open={languageOpen}
        value={language}
        items={languageItems}
        setOpen={setLanguageOpen}
        setValue={setLanguage}
        setItems={setLanguageItems}
        placeholder="Select a language"
        style={[styles.dropdown, { backgroundColor: theme.input }]}
        textStyle={{ color: theme.text }}
        dropDownContainerStyle={[styles.dropdownContainer, { backgroundColor: theme.input }]}
        placeholderStyle={{ color: theme.placeholder }}
        zIndex={2000}
        zIndexInverse={2000}
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleSave}>
        <Text style={[styles.buttonText, { color: theme.background }]}>Save Settings</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  dropdown: {
    borderColor: '#ccc',
    marginBottom: 20,
  },
  dropdownContainer: {
    borderColor: '#ccc',
  },
  button: {
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});