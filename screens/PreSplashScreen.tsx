import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../store/types';

type PreSplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PreSplash'>;

const PreSplashScreen: React.FC = () => {
  const navigation = useNavigation<PreSplashScreenNavigationProp>();
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('Splash');
      });
    }, 4000);
  }, [navigation, fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
        <View style={styles.logo}>
          <Image 
            source={require('../assets/image.png')} 
            style={styles.logoImage} 
            resizeMode="contain" 
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#27251F',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%', 
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 100, 
    height: 100,
  },
});

export default PreSplashScreen;