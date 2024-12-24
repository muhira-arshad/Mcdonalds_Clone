import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

interface LocationAdjustmentMapProps {
  region: Region | null;
  onRegionChangeComplete: (region: Region) => void;
  onMapPress: (event: {
    nativeEvent: { coordinate: { latitude: number; longitude: number } };
  }) => void;
  onRegionChange?: (region: Region) => void; 
}

const LocationAdjustmentMap: React.FC<LocationAdjustmentMapProps> = ({
  region,
  onRegionChange,
  onRegionChangeComplete,
  onMapPress,
}) => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region || { latitude: 0, longitude: 0, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
        region={region || undefined} 
        onRegionChange={onRegionChange}
        onRegionChangeComplete={onRegionChangeComplete}
        onPress={onMapPress}
      >
        <Marker coordinate={region || { latitude: 0, longitude: 0 }}>
          <View style={styles.customPin}>
            <View style={styles.pinShadow} />
            <View style={styles.pinBody}>
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/732/732217.png",
                }}
                style={styles.logo}
              />
            </View>
            <View style={styles.pinPoint} />
          </View>
        </Marker>
      </MapView>

      <Text style={styles.instructions}>
        Drag the map to adjust your location
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    marginBottom: 20,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  instructions: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 5,
    textAlign: "center",
  },
  customPin: {
    alignItems: "center",
    justifyContent: "center",
  },
  pinBody: {
    width: 36,
    height: 36,
    backgroundColor: "#DA291C",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pinPoint: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#DA291C",
    transform: [{ rotate: "180deg" }],
    marginTop: -1,
  },
  pinShadow: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    transform: [{ translateY: 2 }],
  },
  logo: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});

export default LocationAdjustmentMap;