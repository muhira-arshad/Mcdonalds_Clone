import { NativeModules, Platform } from 'react-native';

const initializeMapModule = () => {
  if (Platform.OS === 'ios') {
    NativeModules.AirMapModule = NativeModules.AirMapModule || {
      constants: {
        isIOS: true,
      },
    };
  }
};

export default initializeMapModule;

