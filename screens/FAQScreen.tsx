import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { supabase } from '../utils/supabase';
import { useTheme } from '../components/ThemeContext';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const FAQScreen: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('order_num');

      if (error) {
        throw error;
      }

      if (data) {
        setFaqs(data);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.text === '#000000' ? "dark-content" : "light-content"} />
      <ScrollView>
        <Text style={[styles.title, { color: theme.primary }]}>Frequently Asked Questions</Text>
        {faqs.map((faq, index) => (
          <View key={faq.id} style={[styles.faqItem, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => toggleExpand(index)}>
              <Text style={[styles.question, { color: theme.text }]}>{faq.question}</Text>
            </TouchableOpacity>
            {expandedIndex === index && (
              <Text style={[styles.answer, { color: theme.text }]}>{faq.answer}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  answer: {
    fontSize: 16,
    marginTop: 8,
  },
});

export default FAQScreen;