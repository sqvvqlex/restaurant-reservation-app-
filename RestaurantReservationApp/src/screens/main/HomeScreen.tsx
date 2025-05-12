import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
  InteractionManager,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { restaurantService } from '../../services/api';
import type { Restaurant } from '../../types/navigation';
import type { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const mounted = useRef(true);

  const fetchRestaurants = useCallback(async (search?: string, loc?: string) => {
    if (!mounted.current) return;
    
    try {
      const params = { search, location: loc };
      console.log('fetchRestaurants called with params:', params);
      const response = await restaurantService.getAll(params);
      console.log('fetchRestaurants response:', response);
      
      if (mounted.current) {
        // Apply client-side filtering
        let filteredResults = response;
        
        if (search && search.trim()) {
          const searchLower = search.toLowerCase().trim();
          filteredResults = filteredResults.filter(restaurant => 
            restaurant.name.toLowerCase().includes(searchLower) ||
            restaurant.cuisine_type.toLowerCase().includes(searchLower) ||
            restaurant.description.toLowerCase().includes(searchLower)
          );
        }
        
        if (loc && loc.trim()) {
          const locationLower = loc.toLowerCase().trim();
          filteredResults = filteredResults.filter(restaurant =>
            restaurant.location.toLowerCase().includes(locationLower)
          );
        }

        console.log('Filtered results:', filteredResults.length);
        setRestaurants(filteredResults);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      if (mounted.current) {
        setError('Failed to load restaurants. Please try again.');
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      mounted.current = true;
      let frameId: number;

      const loadInitialData = async () => {
        if (!mounted.current) return;
        
        setLoading(true);
        try {
          // Use InteractionManager to ensure the navigation transition is complete
          await new Promise<void>(resolve => 
            InteractionManager.runAfterInteractions(() => resolve())
          );
          await fetchRestaurants();
        } finally {
          if (mounted.current) {
            setLoading(false);
          }
        }
      };

      frameId = requestAnimationFrame(() => {
        loadInitialData();
      });

      return () => {
        mounted.current = false;
        cancelAnimationFrame(frameId);
        if (searchTimeout.current) {
          clearTimeout(searchTimeout.current);
        }
      };
    }, [fetchRestaurants])
  );

  // Separate effect for handling search
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      if (mounted.current) {
        fetchRestaurants(searchQuery, locationQuery);
      }
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery, locationQuery, fetchRestaurants]);

  const handleSearchInput = useCallback((text: string, isLocation: boolean) => {
    if (isLocation) {
      setLocationQuery(text);
    } else {
      setSearchQuery(text);
    }
  }, []);

  const handleSubmitSearch = useCallback(() => {
    console.log('handleSubmitSearch called with current values:', {
      search: searchQuery,
      location: locationQuery
    });
    
    // Clear any pending timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Perform immediate search
    setLoading(true);
    fetchRestaurants(searchQuery, locationQuery)
      .finally(() => {
        if (mounted.current) {
          setLoading(false);
        }
      });
  }, [fetchRestaurants, searchQuery, locationQuery]);

  const onRefresh = useCallback(async () => {
    if (!mounted.current) return;
    
    setRefreshing(true);
    await fetchRestaurants(searchQuery, locationQuery);
    if (mounted.current) {
      setRefreshing(false);
    }
  }, [fetchRestaurants, searchQuery, locationQuery]);

  const renderRestaurantItem = useCallback(({ item }: { item: Restaurant }) => {
    if (!item?.id) return null;

    return (
      <TouchableOpacity
        style={styles.restaurantCard}
        onPress={() => {
          InteractionManager.runAfterInteractions(() => {
            if (mounted.current) {
              navigation.navigate('RestaurantDetails', { restaurant: item });
            }
          });
        }}
      >
        <View style={styles.cardContent}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          <Text style={styles.location}>{item.location}</Text>
          <Text style={styles.cuisineType}>{item.cuisine_type}</Text>
          {item?.description && (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <View style={styles.hoursContainer}>
            <Text style={styles.hours}>Open: {item.opening_hours} - {item.closing_hours}</Text>
            <Text style={styles.capacity}>Max Capacity: {item.max_capacity}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [navigation]);

  // Add debug render for restaurants
  useEffect(() => {
    console.log('Restaurants state updated:', restaurants.length);
  }, [restaurants]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={restaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, Platform.OS === 'ios' && styles.iosInput]}
                placeholder="Search restaurants..."
                value={searchQuery}
                onChangeText={text => handleSearchInput(text, false)}
                returnKeyType="search"
                clearButtonMode="while-editing"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                spellCheck={false}
                selectTextOnFocus={false}
                scrollEnabled={false}
              />
            </View>
            <View style={styles.locationInputContainer}>
              <Ionicons name="location-outline" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, Platform.OS === 'ios' && styles.iosInput]}
                placeholder="Filter by location..."
                value={locationQuery}
                onChangeText={text => handleSearchInput(text, true)}
                returnKeyType="search"
                clearButtonMode="while-editing"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                spellCheck={false}
                selectTextOnFocus={false}
                scrollEnabled={false}
              />
            </View>
          </View>
        }
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            enabled={!loading} 
          />
        }
        ListEmptyComponent={
          error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={() => fetchRestaurants(searchQuery, locationQuery)}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No restaurants found</Text>
            </View>
          )
        }
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        onEndReachedThreshold={0.5}
        scrollEventThrottle={16}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 8,
    minHeight: Platform.select({ ios: 40, android: 48 }),
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 8,
    minHeight: Platform.select({ ios: 40, android: 48 }),
  },
  searchIcon: {
    marginHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    height: Platform.select({ ios: 40, android: 48 }),
    fontSize: 16,
    color: '#000',
    padding: Platform.select({ ios: 8, android: 10 }),
    backgroundColor: 'transparent',
    textAlignVertical: 'center',
  },
  iosInput: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  listContainer: {
    flexGrow: 1,
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: Platform.select({ android: 2, ios: 0 }),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000',
  },
  cuisineType: {
    color: '#007AFF',
    fontSize: 14,
    marginBottom: 8,
  },
  location: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  description: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  hoursContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  hours: {
    color: '#666',
    fontSize: 12,
  },
  capacity: {
    color: '#666',
    fontSize: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
}); 