import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { reservationService } from '../../services/api';
import type { RootStackParamList } from '../../types/navigation';
import type { Reservation } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ReservationListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReservations = async () => {
    try {
      console.log('Fetching reservations...');
      const data = await reservationService.getUserReservations();
      console.log('Raw reservation data:', JSON.stringify(data, null, 2));
      setReservations(data);
    } catch (error: any) {
      console.error('Detailed error:', {
        message: error.message,
        status: error.status,
        code: error.code,
        response: error.response?.data
      });
      Alert.alert(
        'Error',
        `Failed to fetch reservations: ${error.message || 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReservations();
    setRefreshing(false);
  };

  const handleCancelReservation = async (id: number) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await reservationService.cancel(id);
              await fetchReservations();
              Alert.alert('Success', 'Reservation cancelled successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel reservation');
            }
          },
        },
      ]
    );
  };

  const renderReservationItem = ({ item }: { item: Reservation }) => {
    console.log('Rendering reservation item:', {
      id: item.id,
      restaurant: item.restaurant,
      hasRestaurant: !!item.restaurant
    });
    
    return (
    <View style={styles.reservationCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.restaurantName}>{item.restaurant?.name || 'Unknown Restaurant'}</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.details}>Date: {formatDate(item.reservation_date)}</Text>
      <Text style={styles.details}>Time: {item.reservation_time}</Text>
      <Text style={styles.details}>People: {item.party_size}</Text>
      {item.special_requests && (
        <Text style={styles.details}>Notes: {item.special_requests}</Text>
      )}
      {item.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => {
              console.log('Edit button pressed, full reservation data:', item);
              console.log('Restaurant data for editing:', {
                id: item.restaurant?.id,
                name: item.restaurant?.name,
                location: item.restaurant?.location,
                description: item.restaurant?.description,
                cuisine_type: item.restaurant?.cuisine_type,
                opening_hours: item.restaurant?.opening_hours,
                closing_hours: item.restaurant?.closing_hours,
                max_capacity: item.restaurant?.max_capacity
              });
              
              if (item.restaurant && item.restaurant.id) {
                navigation.navigate('ReservationForm', {
                  restaurant: {
                    id: item.restaurant.id,
                    name: item.restaurant.name,
                    location: item.restaurant.location,
                    description: item.restaurant.description || '',
                    cuisine_type: item.restaurant.cuisine_type || '',
                    opening_hours: item.restaurant.opening_hours,
                    closing_hours: item.restaurant.closing_hours,
                    max_capacity: item.restaurant.max_capacity
                  },
                  reservation: item
                });
              } else {
                console.error('Missing restaurant data:', item.restaurant);
                Alert.alert('Error', 'Complete restaurant information is not available. Please try again later.');
              }
            }}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelReservation(item.id)}
          >
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reservations}
        renderItem={renderReservationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reservations found</Text>
          </View>
        }
      />
    </View>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return '#4CAF50';
    case 'pending':
      return '#FFC107';
    case 'cancelled':
      return '#F44336';
    default:
      return '#000000';
  }
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  reservationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    borderRadius: 4,
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
}); 