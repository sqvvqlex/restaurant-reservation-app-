import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { reservationService } from '../../services/api';
import type { RootStackParamList, Restaurant, Reservation } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ReservationFormScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { restaurant, reservation } = route.params as { 
    restaurant: Restaurant;
    reservation?: Reservation;
  };

  const [date, setDate] = useState(
    reservation 
      ? new Date(reservation.reservation_date)
      : new Date()
  );
  const [time, setTime] = useState(
    reservation
      ? new Date(`2000-01-01T${reservation.reservation_time}`)
      : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [partySize, setPartySize] = useState(
    reservation ? reservation.party_size : 2
  );
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Format date and time for API
      const formattedDate = date.toISOString().split('T')[0];
      const formattedTime = time.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      const reservationData = {
        restaurant_id: restaurant.id,
        date: formattedDate,
        time: formattedTime,
        party_size: partySize,
      };

      if (reservation) {
        // Update existing reservation
        await reservationService.update(reservation.id, reservationData);
        Alert.alert(
          'Success',
          'Reservation updated successfully!',
          [
            {
              text: 'View My Reservations',
              onPress: () => {
                navigation.navigate('MainTabs', {
                  screen: 'Reservations'
                });
              },
            },
            { text: 'OK', onPress: () => navigation.goBack() },
          ]
        );
      } else {
        // Create new reservation
        await reservationService.create(reservationData);
        Alert.alert(
          'Success',
          'Reservation created successfully!',
          [
            {
              text: 'View My Reservations',
              onPress: () => {
                navigation.navigate('MainTabs', {
                  screen: 'Reservations'
                });
              },
            },
            { text: 'OK', onPress: () => navigation.goBack() },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save reservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{restaurant.name}</Text>
        <Text style={styles.location}>{restaurant.location}</Text>
        <Text style={styles.hours}>
          Open: {restaurant.opening_hours} - {restaurant.closing_hours}
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar" size={24} color="#007AFF" />
          <Text style={styles.pickerText}>
            {date.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Select Time</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Ionicons name="time" size={24} color="#007AFF" />
          <Text style={styles.pickerText}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Number of People</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setPartySize(Math.max(1, partySize - 1))}
          >
            <Ionicons name="remove" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.counterText}>{partySize}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setPartySize(Math.min(10, partySize + 1))}
          >
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
              <TouchableWithoutFeedback>
                <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => selectedDate && setDate(selectedDate)}
                    minimumDate={new Date()}
                  />
                  <TouchableOpacity
                    style={{ marginTop: 10, alignSelf: 'flex-end' }}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={{ color: '#007AFF', fontWeight: 'bold', fontSize: 16 }}>Done</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Time Picker Modal */}
        <Modal
          visible={showTimePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowTimePicker(false)}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
              <TouchableWithoutFeedback>
                <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
                  <DateTimePicker
                    value={time}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedTime) => selectedTime && setTime(selectedTime)}
                  />
                  <TouchableOpacity
                    style={{ marginTop: 10, alignSelf: 'flex-end' }}
                    onPress={() => setShowTimePicker(false)}
                  >
                    <Text style={{ color: '#007AFF', fontWeight: 'bold', fontSize: 16 }}>Done</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {reservation ? 'Update Reservation' : 'Make Reservation'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  restaurantInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  hours: {
    fontSize: 14,
    color: '#666',
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  counterButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 24,
    minWidth: 30,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 