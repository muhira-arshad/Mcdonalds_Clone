import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import { setDeliveryAddress } from '../store/deliverySlice';
import * as Location from 'expo-location';
import { Region } from 'react-native-maps';
import LocationAdjustmentMap from '../components/LocationAdjustmentMap';
import { useTheme } from '../components/ThemeContext';

type RootStackParamList = {
  PaymentMethod: undefined;
};

type DeliveryAddressScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PaymentMethod'>;

const GOOGLE_MAPS_API_KEY = 'AIzaSyBrOPiXgopDtW9k1FLFeH54cZVpxf9JpXw'; // Replace with your actual API key

const citiesWithAreas: { [key: string]: string[] } = {
  Karachi: ['Gulshan', 'Clifton', 'DHA', 'Korangi', 'North Nazimabad', 'Saddar'],
  Lahore: ['Gulberg', 'Model Town', 'Johar Town', 'DHA', 'Cantt', 'Wapda Town'],
  Islamabad: ['F-6', 'F-7', 'G-10', 'G-11', 'E-11', 'I-8'],
  Rawalpindi: ['Saddar', 'Bahria Town', 'DHA', 'Chaklala', 'Westridge'],
  Faisalabad: ['Madina Town', 'Peoples Colony', 'Jinnah Colony', 'Gulberg'],
  Multan: ['Gulgasht Colony', 'Cantt', 'Model Town', 'Bosan Road'],
};

const DeliveryAddressScreen: React.FC = () => {
  const navigation = useNavigation<DeliveryAddressScreenNavigationProp>();
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const [addressOption, setAddressOption] = useState<'current' | 'manual' | null>(null);
  const [cityOpen, setCityOpen] = useState(false);
  const [cityValue, setCityValue] = useState<string | null>(null);
  const [cityItems, setCityItems] = useState(
    Object.keys(citiesWithAreas).map((city) => ({ label: city, value: city }))
  );

  const [areaOpen, setAreaOpen] = useState(false);
  const [areaValue, setAreaValue] = useState<string | null>(null);
  const [areaItems, setAreaItems] = useState<{ label: string; value: string }[]>([]);

  const [houseNumber, setHouseNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);

  useEffect(() => {
    if (cityValue && cityValue !== 'Current Location') {
      setAreaItems(citiesWithAreas[cityValue].map((area) => ({ label: area, value: area })));
    } else {
      setAreaItems([]);
    }
  }, [cityValue]);

  const handleCityChange = (value: string | null) => {
    setCityValue(value);
    setAreaValue(null);
  };

  const handlePhoneNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, 11);
    let formatted = limited;
    if (limited.length > 4) {
      formatted = `${limited.slice(0, 4)}-${limited.slice(4)}`;
    }
    setPhoneNumber(formatted);
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  };

  const handleCurrentLocation = async () => {
    setIsLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        setIsLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const address = await reverseGeocode(location.coords.latitude, location.coords.longitude);

      if (address) {
        setAddressOption('current');
        setCityValue('Current Location');
        setAreaValue(address);
        setCurrentAddress(address);

        const region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setMapRegion(region);
      } else {
        Alert.alert('Error', 'Unable to fetch your current location. Please try again or enter manually.');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Unable to fetch your current location. Please try again or enter manually.');
    }
    setIsLoading(false);
  };

  const handleRegionChangeComplete = (region: Region) => {
    setMapRegion(region);
    reverseGeocode(region.latitude, region.longitude).then((address) => {
      if (address) {
        setAreaValue(address);
        setCurrentAddress(address);
      }
    });
  };

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  const handleConfirm = () => {
    if (addressOption === 'current' && (!currentAddress || !phoneNumber)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (addressOption === 'manual' && (!cityValue || !areaValue || !houseNumber || !phoneNumber)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const address = {
      houseNumber: addressOption === 'current' ? 'Current Location' : houseNumber,
      area: addressOption === 'current' ? currentAddress || '' : areaValue || '',
      city: addressOption === 'current' ? 'Current Location' : cityValue || '',
      phoneNumber: phoneNumber,
    };

    dispatch(setDeliveryAddress(address));
    navigation.navigate('PaymentMethod');
  };

  const handleMapPress = (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { coordinate } = event.nativeEvent;
    setMapRegion({
      ...mapRegion!,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
    handleRegionChangeComplete({
      ...mapRegion!,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
  };

  const renderContent = () => (
    <View style={styles.cardContent}>
      {!addressOption && (
        <View>
          <TouchableOpacity style={styles.optionButton} onPress={handleCurrentLocation} disabled={isLoading}>
            <Text style={styles.optionButtonText}>
              {isLoading ? 'Fetching Location...' : 'Use Current Location'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={() => setAddressOption('manual')}>
            <Text style={styles.optionButtonText}>Enter Different Location</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && <ActivityIndicator size="large" color="#ffbc0d" />}

      {addressOption && !isLoading && (
        <View style={styles.scrollContent}>
          <Text style={[styles.label, { color: theme.text }]}>Address</Text>
          {addressOption === 'current' ? (
            <>
              <Text style={[styles.currentLocationText, { color: theme.text, backgroundColor: theme.border }]}>{currentAddress}</Text>
              <TouchableOpacity style={styles.optionButton} onPress={toggleMap}>
                <Text style={styles.optionButtonText}>
                  {showMap ? 'Hide Map' : 'Not Your Location? Adjust on Map'}
                </Text>
              </TouchableOpacity>
              {showMap && mapRegion && (
                <LocationAdjustmentMap
                  region={mapRegion}
                  onRegionChange={setMapRegion}
                  onRegionChangeComplete={handleRegionChangeComplete}
                  onMapPress={handleMapPress}
                />
              )}
            </>
          ) : (
            <>
              <DropDownPicker
                open={cityOpen}
                value={cityValue}
                items={cityItems}
                setOpen={setCityOpen}
                setValue={setCityValue}
                setItems={setCityItems}
                onChangeValue={handleCityChange}
                placeholder="Select City"
                style={[styles.dropdown, { backgroundColor: theme.input }]}
                dropDownContainerStyle={[styles.dropdownContainer, { backgroundColor: theme.input }]}
                textStyle={{ color: theme.text }}
                zIndex={3000}
                zIndexInverse={1000}
              />

              <Text style={[styles.label, { color: theme.text }]}>Area</Text>
              <DropDownPicker
                open={areaOpen}
                value={areaValue}
                items={areaItems}
                setOpen={setAreaOpen}
                setValue={setAreaValue}
                setItems={setAreaItems}
                placeholder="Select Area"
                style={[styles.dropdown, { backgroundColor: theme.input }]}
                dropDownContainerStyle={[styles.dropdownContainer, { backgroundColor: theme.input }]}
                textStyle={{ color: theme.text }}
                disabled={!cityValue}
                zIndex={2000}
                zIndexInverse={2000}
              />

              <Text style={[styles.label, { color: theme.text }]}>House Number and Block</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.input, color: theme.text }]}
                placeholder="House Number and Block"
                placeholderTextColor={theme.placeholder}
                value={houseNumber}
                onChangeText={setHouseNumber}
              />
            </>
          )}

          <Text style={[styles.label, { color: theme.text }]}>Phone Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.input, color: theme.text }]}
            placeholder="Phone Number"
            placeholderTextColor={theme.placeholder}
            value={phoneNumber}
            onChangeText={handlePhoneNumberChange}
            keyboardType="phone-pad"
            maxLength={12}
          />

          <TouchableOpacity style={styles.button} onPress={handleConfirm}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  cardContent: {
    flex: 1,
  },
  optionButton: {
    padding: 10,
    backgroundColor: '#ffbc0d',
    marginVertical: 10,
    borderRadius: 5,
  },
  optionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  scrollContent: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
  },
  input: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 5,
    fontSize: 16,
    marginBottom: 10,
  },
  dropdown: {
    borderRadius: 5,
    marginBottom: 10,
  },
  dropdownContainer: {
    borderRadius: 5,
  },
  button: {
    padding: 15,
    backgroundColor: '#ffbc0d',
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
  currentLocationText: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
  },
});

export default DeliveryAddressScreen;