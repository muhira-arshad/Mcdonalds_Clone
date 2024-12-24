import React, { useState, useEffect, useMemo } from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  View,
  SafeAreaView,
  StatusBar,
  FlatList,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Rating } from 'react-native-ratings';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Searchbar } from 'react-native-paper';
import { supabase } from '../utils/supabase';
import { RootState } from '../store';
import { useTheme } from '../components/ThemeContext';
import { useNotification } from '../components/NotificationContext';
import { MapPin, Star } from 'lucide-react-native';

type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
};

type RateUsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

type Branch = {
  id: number;
  name: string;
  address: string;
};

const RateUsScreen: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [rating, setRating] = useState(0);
  const { theme } = useTheme();
  const navigation = useNavigation<RateUsScreenNavigationProp>();
  const { showNotification } = useNotification();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    const { data, error } = await supabase
      .from('mcdonalds_branches')
      .select('id, name, address');
    
    if (error) {
      console.error('Error fetching branches:', error);
    } else {
      setBranches(data || []);
    }
  };

  const filteredBranches = useMemo(() => {
    return branches.filter(branch =>
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [branches, searchQuery]);

  const handleSubmit = async () => {
    if (!user) {
      showNotification('Please log in to submit a rating.', 'error');
      navigation.navigate('Login');
      return;
    }

    if (selectedBranch && rating > 0) {
      try {
        // Insert into userbranchexperience table
        const { error: experienceError } = await supabase
          .from('userbranchexperience')
          .insert({
            user_id: user.id,
            branch_id: selectedBranch.id,
            rating: rating
          });

        if (experienceError) throw experienceError;

        // Update branch_ratings table
        const { data: existingRating, error: fetchError } = await supabase
          .from('branch_ratings')
          .select('average_rating, total_ratings')
          .eq('branch_id', selectedBranch.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        let newAverage, newTotal;
        if (existingRating) {
          newTotal = existingRating.total_ratings + 1;
          newAverage = (existingRating.average_rating * existingRating.total_ratings + rating) / newTotal;
        } else {
          newAverage = rating;
          newTotal = 1;
        }

        const { error: updateError } = await supabase
          .from('branch_ratings')
          .upsert({
            branch_id: selectedBranch.id,
            average_rating: newAverage,
            total_ratings: newTotal
          });

        if (updateError) throw updateError;

        showNotification(`Thank you! Your rating of ${rating} stars for ${selectedBranch.name} has been submitted.`, 'success');
        navigation.navigate('MainTabs');
      } catch (error) {
        console.error('Error submitting rating:', error);
        showNotification('Failed to submit rating. Please try again.', 'error');
      }
    } else {
      showNotification('Please select a branch and a rating.', 'error');
    }
  };

  const renderBranchItem = ({ item }: { item: Branch }) => (
    <TouchableOpacity
      style={[
        styles.branchItem,
        selectedBranch?.id === item.id && styles.selectedBranchItem,
        { backgroundColor: theme.card }
      ]}
      onPress={() => setSelectedBranch(item)}
    >
      <View style={styles.branchInfo}>
        <Text style={[styles.branchName, { color: theme.text }]}>{item.name}</Text>
        <View style={styles.addressContainer}>
          <MapPin size={16} color={theme.secondary} />
          <Text style={[styles.branchAddress, { color: theme.secondary }]}>{item.address}</Text>
        </View>
      </View>
      {selectedBranch?.id === item.id && (
        <View style={[styles.selectedIndicator, { backgroundColor: theme.primary }]}>
          <Star size={16} color={theme.background} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (!user) {
      return (
        <View style={styles.contentContainer}>
           <Image
            source={require('../assets/image-removebg-preview.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: theme.text }]}>Please log in to rate your experience</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>Log In</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        <Image
          source={require('../assets/image-removebg-preview.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: theme.text }]}>Rate Your Experience</Text>
        <Searchbar
          placeholder="Search for a branch"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.card }]}
          inputStyle={{ color: theme.text }}
          iconColor={theme.primary}
          placeholderTextColor={theme.primary}
        />
        <FlatList
          data={filteredBranches}
          renderItem={renderBranchItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.branchList}
          contentContainerStyle={styles.branchListContent}
        />
        <View style={styles.ratingContainer}>
          <Text style={[styles.ratingTitle, { color: theme.text }]}>Your Rating</Text>
          <Rating
            type="custom"
            ratingColor={theme.primary}
            ratingBackgroundColor={theme.border}
            tintColor={theme.background}
            imageSize={40}
            startingValue={rating}
            onFinishRating={setRating}
          />
        </View>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleSubmit}
        >
          <Text style={[styles.buttonText, { color: theme.background }]}>Submit Rating</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.text === '#000000' ? "dark-content" : "light-content"} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {renderContent()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchBar: {
    width: '100%',
    marginBottom: 10,
    elevation: 0,
    borderRadius: 10,
  },
  branchList: {
    width: '100%',
    marginBottom: 20,
  },
  branchListContent: {
    paddingBottom: 20,
  },
  branchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedBranchItem: {
    borderWidth: 2,
    borderColor: 'theme.primary',
  },
  branchInfo: {
    flex: 1,
  },
  branchName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  branchAddress: {
    fontSize: 14,
    marginLeft: 5,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default RateUsScreen;

