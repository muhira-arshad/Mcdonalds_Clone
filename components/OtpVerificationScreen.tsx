import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { supabase } from '../utils/supabase';
import { useTheme } from './ThemeContext';

type RootStackParamList = {
  Login: undefined;
  OtpVerification: { email: string };
};

type OtpVerificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OtpVerification'>;
type OtpVerificationScreenRouteProp = RouteProp<RootStackParamList, 'OtpVerification'>;

const OtpVerificationScreen: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<OtpVerificationScreenNavigationProp>();
  const route = useRoute<OtpVerificationScreenRouteProp>();
  const { theme } = useTheme();

  const { email } = route.params;

  const handleResetPassword = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery',
      });

      if (verifyError) throw verifyError;

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Password has been reset successfully.',
      });

      navigation.navigate('Login');
    } catch (error: any) {
      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'An error occurred while resetting the password.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Add the logo/image here */}
      <Image
        source={require('../assets/image.png')} // Update the path to your image
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={[styles.title, { color: theme.text }]}>Verify OTP</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        placeholder="Enter OTP"
        placeholderTextColor={theme.text}
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
      />
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        placeholder="New Password"
        placeholderTextColor={theme.text}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton, { backgroundColor: theme.primary }]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        <Text style={[styles.buttonText, { color: theme.background }]}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default OtpVerificationScreen;