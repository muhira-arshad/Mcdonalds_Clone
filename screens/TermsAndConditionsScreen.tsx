import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, StatusBar, Image } from 'react-native';
import { supabase } from '../utils/supabase';
import { useTheme } from '../components/ThemeContext';

interface TermsAndConditions {
  id: number;
  title: string;
  content: string;
  order_num: number;
}

export default function TermsAndConditionsScreen() {
  const [termsAndConditions, setTermsAndConditions] = useState<TermsAndConditions[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    fetchTermsAndConditions();
  }, []);

  async function fetchTermsAndConditions() {
    try {
      const { data, error } = await supabase
        .from('terms_and_conditions')
        .select('*')
        .order('order_num');

      if (error) {
        throw error;
      }

      if (data) {
        setTermsAndConditions(data);
      }
    } catch (error) {
      console.error('Error fetching terms and conditions:', error);
    } finally {
      setLoading(false);
    }
  }

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

      <Image
        source={{ uri: 'https://miro.medium.com/v2/resize:fit:1168/1*XLwx01olsoA32kTSs8zl9Q.png' }}
        style={styles.image}
        resizeMode="cover"
      />

      <ScrollView>
        {termsAndConditions.map((item, index) => (
          <View key={item.id}>
            {index === 0 ? (
              <Text style={[styles.title, { color: theme.primary }]}>{item.title}</Text>
            ) : (
              <Text style={[styles.heading, { color: theme.text }]}>{`${index}. ${item.title}`}</Text>
            )}
            <Text style={[styles.paragraph, { color: theme.text }]}>{item.content}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

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
  image: {
    width: '100%',
    height: 270,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 16,
  },
});