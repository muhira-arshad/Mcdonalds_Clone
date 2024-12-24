import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { supabase } from '../utils/supabase';
import { useTheme } from '../components/ThemeContext';

type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  OtpVerification: { email: string };
};

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { theme } = useTheme();

  const handleSendOTP = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'yourapp://reset-password',
      });

      if (error) throw error;

      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'OTP has been sent to your email.',
      });

      navigation.navigate('OtpVerification', { email });
    } catch (error: any) {
      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'An error occurred while sending OTP.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image
        source={require('../assets/image-removebg-preview.png')} // Replace with your image path
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={[styles.title, { color: theme.text }]}>Forgot Password</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        placeholder="Email"
        placeholderTextColor={theme.text}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton, { backgroundColor: theme.primary }]}
        onPress={handleSendOTP}
        disabled={loading}
      >
        <Text style={[styles.buttonText, { color: theme.background }]}>
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 29,
    justifyContent: 'center',
  },
  image: {
    width: 100,
    height: 150,
    alignSelf: 'center',
    marginBottom: 15,
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

export default ForgotPasswordScreen;