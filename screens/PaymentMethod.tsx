import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Modal, Image, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import { setPaymentMethod, setCardDetails } from '../store/paymentSlice';
import { RootStackParamList } from '../store/types';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../components/ThemeContext';

type PaymentMethodScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PaymentMethod'>;

const PaymentMethodScreen: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<'Cash on Delivery' | 'Pay with Card' | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [cardNumberError, setCardNumberError] = useState(false);
  const [expirationDateError, setExpirationDateError] = useState(false);
  const [cvvError, setCvvError] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [paymentMethodErrorMessage, setPaymentMethodErrorMessage] = useState('');

  const navigation = useNavigation<PaymentMethodScreenNavigationProp>();
  const dispatch = useDispatch();
  const { theme } = useTheme();

  useEffect(() => {
    if (selectedMethod) {
      setPaymentMethodErrorMessage('');
      dispatch(setPaymentMethod(selectedMethod));
    }
  }, [selectedMethod, dispatch]);

  const handleConfirmPayment = () => {
    setCardNumberError(false);
    setExpirationDateError(false);
    setCvvError(false);
    setFormErrorMessage('');
    setPaymentMethodErrorMessage('');

    if (!selectedMethod) {
      setPaymentMethodErrorMessage('Please select a payment method');
      return;
    }

    if (selectedMethod === 'Pay with Card' && (!cardNumber || !expirationDate || !cvv)) {
      if (!cardNumber) setCardNumberError(true);
      if (!expirationDate) setExpirationDateError(true);
      if (!cvv) setCvvError(true);
      setFormErrorMessage('Please fill all the fields');
      return;
    }

    if (selectedMethod === 'Pay with Card') {
      dispatch(setCardDetails({ cardNumber, expirationDate, cvv }));
    }

    navigation.navigate('OrderSummary');
  };

  const handleDateSelect = (date: string) => {
    setExpirationDate(date);
    setIsCalendarVisible(false);
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1-');
    setCardNumber(formatted);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.text === '#000000' ? "dark-content" : "light-content"} />
      <Text style={[styles.title, { color: theme.text }]}>Select Payment Method</Text>

      {paymentMethodErrorMessage ? (
        <Text style={[styles.errorMessage, { color: theme.secondary }]}>{paymentMethodErrorMessage}</Text>
      ) : null}

      <TouchableOpacity
        style={[
          styles.methodButton,
          { backgroundColor: selectedMethod === 'Cash on Delivery' ? theme.primary : theme.card },
        ]}
        onPress={() => setSelectedMethod('Cash on Delivery')}
      >
        <Text style={[styles.methodText, { color: selectedMethod === 'Cash on Delivery' ? theme.background : theme.text }]}>
          Cash on Delivery
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.methodButton,
          { backgroundColor: selectedMethod === 'Pay with Card' ? theme.primary : theme.card },
        ]}
        onPress={() => setSelectedMethod('Pay with Card')}
      >
        <Text style={[styles.methodText, { color: selectedMethod === 'Pay with Card' ? theme.background : theme.text }]}>
          Pay with Card
        </Text>
      </TouchableOpacity>

      {selectedMethod === 'Pay with Card' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.cardInputsContainer}
        >
          <View style={styles.paymentHeaderContainer}>
            <Text style={[styles.paymentHeading, { color: theme.text }]}>Visa/Master Payment</Text>
            <Image
              source={{ uri: 'https://www.fintechfutures.com/files/2019/01/Mastercard-logo-2019.jpg' }}
              style={styles.cardIcon}
            />
          </View>

          {formErrorMessage ? (
            <Text style={[styles.errorMessage, { color: theme.secondary }]}>{formErrorMessage}</Text>
          ) : null}

          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.input, color: theme.text },
              cardNumberError && styles.inputError
            ]}
            placeholder="Card Number"
            placeholderTextColor={theme.placeholder}
            keyboardType="numeric"
            value={cardNumber}
            onChangeText={formatCardNumber}
            maxLength={19}
          />

          <TouchableOpacity
            style={[
              styles.input,
              { backgroundColor: theme.input },
              expirationDateError && styles.inputError
            ]}
            onPress={() => setIsCalendarVisible(true)}
          >
            <Text style={{ color: expirationDate ? theme.text : theme.placeholder }}>
              {expirationDate ? expirationDate : 'Expiration Date (MM/YY)'}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.input, color: theme.text },
              cvvError && styles.inputError
            ]}
            placeholder="CVV"
            placeholderTextColor={theme.placeholder}
            keyboardType="numeric"
            value={cvv}
            onChangeText={setCvv}
            maxLength={3}
          />
        </KeyboardAvoidingView>
      )}

      <TouchableOpacity style={[styles.confirmButton, { backgroundColor: theme.primary }]} onPress={handleConfirmPayment}>
        <Text style={[styles.confirmButtonText, { color: theme.background }]}>Confirm Payment Method</Text>
      </TouchableOpacity>

      <Modal visible={isCalendarVisible} transparent={true} animationType="fade">
        <View style={[styles.calendarContainer, { backgroundColor: theme.background }]}>
          <Calendar
            markedDates={{
              [expirationDate]: { selected: true, selectedColor: theme.primary },
            }}
            onDayPress={(day: { dateString: string }) => {
              if (day.dateString) {
                handleDateSelect(day.dateString);
              }
            }}
            theme={{
              backgroundColor: theme.background,
              calendarBackground: theme.background,
              textSectionTitleColor: theme.text,
              selectedDayBackgroundColor: theme.primary,
              selectedDayTextColor: theme.background,
              todayTextColor: theme.primary,
              dayTextColor: theme.text,
              textDisabledColor: theme.placeholder,
              arrowColor: theme.primary,
              monthTextColor: theme.text,
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '300',
            }}
          />
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.primary }]}
            onPress={() => setIsCalendarVisible(false)}
          >
            <Text style={[styles.closeButtonText, { color: theme.background }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  errorMessage: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  methodButton: {
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  methodText: {
    fontSize: 18
  },
  confirmButton: {
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  cardInputsContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
  },
  paymentHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  paymentHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
  cardIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  input: {
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 2,
    borderColor: 'red',
  },
  calendarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
});

export default PaymentMethodScreen;