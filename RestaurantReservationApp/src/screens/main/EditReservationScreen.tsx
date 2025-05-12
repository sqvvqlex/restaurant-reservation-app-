import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';

type Reservation = {
  id: string;
  restaurant_name: string;
  restaurant_id: string;
  date: string;
  time: string;
  party_size: number;
};

export const EditReservationScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { reservation }: { reservation: Reservation } = route.params;
  const { token } = useAuth();
  
  const [date, setDate] = useState(new Date(reservation.date));
  const [time, setTime] = useState(new Date(`2000-01-01T${reservation.time}`));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [partySize, setPartySize] = useState(reservation.party_size);
  const [loading, setLoading] = useState(false);

  const handleUpdateReservation = async () => {
    try {
      setLoading(true);
      const updatedData = {
        date: date.toISOString().split('T')[0],
        time: time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        party_size: partySize,
      };

      const response = await fetch(
        `http://localhost:3000/api/reservations/${reservation.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update reservation');
      }

      Alert.alert(
        'Success',
        'Reservation updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Reservation</Text>
        <Text style={styles.restaurantName}>{reservation.restaurant_name}</Text>
      </View>

      <View style={styles.form}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>Date: {date.toLocaleDateString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Text>
            Time: {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>

        <View style={styles.partySizeContainer}>
          <Text>Party Size: </Text>
          <TouchableOpacity
            style={styles.partySizeButton}
            onPress={() => setPartySize(Math.max(1, partySize - 1))}
          >
            <Text>-</Text>
          </TouchableOpacity>
          <Text style={styles.partySize}>{partySize}</Text>
          <TouchableOpacity
            style={styles.partySizeButton}
            onPress={() => setPartySize(Math.min(20, partySize + 1))}
          >
            <Text>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.updateButton, loading && styles.buttonDisabled]}
          onPress={handleUpdateReservation}
          disabled={loading}
        >
          <Text style={styles.updateButtonText}>
            {loading ? 'Updating...' : 'Update Reservation'}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    color: '#666',
  },
  form: {
    padding: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  partySizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  partySizeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  partySize: {
    fontSize: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 