import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, Image, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../components/ThemeContext';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBrOPiXgopDtW9k1FLFeH54cZVpxf9JpXw';

interface Branch {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

const MapScreen: React.FC = () => {
  const navigation = useNavigation();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();

    fetchBranches();
  }, []);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('mcdonalds_branches')
        .select('*');

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setErrorMsg('Error fetching branches. Please try again later.');
    }
  };

  const handleShowDirections = useCallback(() => {
    if (!userLocation || !selectedBranch) return;
    setShowDirections(true);
  }, [userLocation, selectedBranch]);

  if (!userLocation) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={theme.text === '#000000' ? "dark-content" : "light-content"} />
        <ActivityIndicator size="large" color="#FFC72C" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.text === '#000000' ? "dark-content" : "light-content"} />
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsTraffic={true}
        showsBuildings={true}
        showsIndoors={true}
      >
        {branches.map((branch) => (
          <Marker
            key={branch.id}
            coordinate={{ latitude: branch.latitude, longitude: branch.longitude }}
            onPress={() => {
              setSelectedBranch(branch);
              setShowDirections(false);
            }}
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerBubble}>
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/732/732217.png' }}
                  style={styles.markerLogo}
                />
              </View>
              <View style={styles.markerArrow} />
            </View>
            <Callout>
              <View>
                <Text style={[styles.calloutTitle, { color: theme.text }]}>{branch.name}</Text>
                <Text style={[styles.calloutAddress, { color: theme.text }]}>{branch.address}</Text>
              </View>
            </Callout>
          </Marker>
        ))}

        {showDirections && selectedBranch && (
          <MapViewDirections
            origin={userLocation}
            destination={{
              latitude: selectedBranch.latitude,
              longitude: selectedBranch.longitude,
            }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={12}
            strokeColor="#4285F4"
            mode="DRIVING"
            optimizeWaypoints={true}
            timePrecision="now"
            language="en"
            region="us"
            precision="high"
            tappable={true}
            onReady={(result) => {
              console.log(`Distance: ${result.distance} km`)
              console.log(`Duration: ${result.duration} min.`)
              setDistance(result.distance.toFixed(2));
            }}
            onError={(errorMessage) => {
              console.error('MapViewDirections error:', errorMessage);
              setErrorMsg('Error displaying directions. Please try again.');
            }}
          />
        )}
      </MapView>
      {selectedBranch && (
        <View style={[styles.bottomSheet, { backgroundColor: theme.card }]}>
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          <Text style={[styles.branchName, { color: theme.text }]}>{selectedBranch.name}</Text>
          <Text style={[styles.branchAddress, { color: theme.text }]}>{selectedBranch.address}</Text>
          {!showDirections && (
            <TouchableOpacity
              style={styles.directionsButton}
              onPress={handleShowDirections}
            >
              <Ionicons name="navigate" size={24} color="white" />
              <Text style={styles.directionsButtonText}>Directions</Text>
            </TouchableOpacity>
          )}
          {showDirections && (
            <View>
              <Text style={[styles.directionsText, { color: theme.text }]}>Directions shown on map</Text>
              {distance && (
                <Text style={[styles.distanceText, { color: theme.text }]}>Distance: {distance} km</Text>
              )}
            </View>
          )}
        </View>
      )}
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  branchName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  branchAddress: {
    fontSize: 14,
    marginBottom: 15,
  },
  directionsButton: {
    backgroundColor: '#DA291C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  directionsButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  directionsText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  calloutAddress: {
    fontSize: 12,
  },
  errorText: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 0,
    backgroundColor: '#ff000080',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
  },
  distanceText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  markerContainer: {
    width: 36,
    height: 50,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  markerBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DA291C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerLogo: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#DA291C',
  },
});

export default MapScreen;