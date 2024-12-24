import React, { useState } from 'react';
import { Text, TextInput, StyleSheet, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
import { supabase } from '../utils/supabase';
import { useTheme } from '../components/ThemeContext';

const ReachOutToUsScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { theme } = useTheme();

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('feedback_support')
        .insert([{ name, email, message }]);

      if (error) throw error;

      Alert.alert('Success', "Your feedback has been sent. We'll get back to you soon!");
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to send feedback. Please try again later.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.text === '#000000' ? "dark-content" : "light-content"} />
      <Text style={[styles.title, { color: theme.text }]}>Reach Out to Us</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.input, color: theme.text }]}
        placeholder="Your Name"
        placeholderTextColor={theme.placeholder}
        value={name}
        onChangeText={(text) => setName(text)}
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.input, color: theme.text }]}
        placeholder="Your Email"
        placeholderTextColor={theme.placeholder}
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
      />
      <TextInput
        style={[styles.input, styles.messageInput, { backgroundColor: theme.input, color: theme.text }]}
        placeholder="Your Message"
        placeholderTextColor={theme.placeholder}
        value={message}
        onChangeText={(text) => setMessage(text)}
        multiline
      />
      <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.primary }]} onPress={handleSubmit}>
        <Text style={[styles.submitButtonText, { color: theme.background }]}>Send Message</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  messageInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReachOutToUsScreen;