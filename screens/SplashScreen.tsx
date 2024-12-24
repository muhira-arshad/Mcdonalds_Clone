import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList} from '../store/types';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const fadeAnim = new Animated.Value(0);
  const barWidth = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    Animated.timing(barWidth, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start();

    const timeout = setTimeout(() => {
      navigation.replace('MainTabs');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [navigation, barWidth]);

  return (
    <View style={styles.container}>
      <Animated.View style={[{ opacity: fadeAnim }, styles.imageContainer]}>
        <Image
          source={{uri: 'https://i.pinimg.com/originals/32/00/21/320021f7e7817fffffffafbde478d99c.jpg'}} 
          style={styles.logo}
        />
      </Animated.View>
      
      <View style={styles.loadingBarContainer}>
        <Animated.View
          style={[styles.loadingBar, {
            width: barWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            })
          }]}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.text}>Working on it...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  imageContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 350,
    height: 175,
    resizeMode: 'contain',
  },
  loadingBarContainer: {
    width: '85%',
    height: 6,
    backgroundColor: '#E3E3E3',
    borderRadius: 3,
    marginBottom: 10,
  },
  loadingBar: {
    height: '100%',
    backgroundColor: '#000000', 
    borderRadius: 3,
  },
  textContainer: {
    width: '85%', 
    backgroundColor: '#F5F5F5', 
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  text: {
    color: '#292929',
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '400',
  },
});

export default SplashScreen;