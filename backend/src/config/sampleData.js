const pool = require('./database');

const sampleRestaurants = [
  {
    name: 'La Taverna',
    location: 'Athens, Greece',
    description: 'Traditional Greek cuisine in a cozy atmosphere',
    cuisine_type: 'Greek',
    rating: 4.5
  },
  {
    name: 'Sushi Master',
    location: 'Thessaloniki, Greece',
    description: 'Fresh sushi and Japanese delicacies',
    cuisine_type: 'Japanese',
    rating: 4.8
  },
  {
    name: 'Pizza Roma',
    location: 'Athens, Greece',
    description: 'Authentic Italian pizzas and pasta',
    cuisine_type: 'Italian',
    rating: 4.3
  },
  {
    name: 'The Grill House',
    location: 'Patras, Greece',
    description: 'Premium steaks and grilled specialties',
    cuisine_type: 'Steakhouse',
    rating: 4.6
  },
  {
    name: 'Mediterranean Flavors',
    location: 'Heraklion, Greece',
    description: 'Fresh seafood and Mediterranean dishes',
    cuisine_type: 'Mediterranean',
    rating: 4.4
  }
];

const insertSampleData = async () => {
  try {
    for (const restaurant of sampleRestaurants) {
      await pool.query(
        'INSERT INTO restaurants (name, location, description, cuisine_type, rating) VALUES (?, ?, ?, ?, ?)',
        [restaurant.name, restaurant.location, restaurant.description, restaurant.cuisine_type, restaurant.rating]
      );
    }
    console.log('Sample restaurants inserted successfully');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
};

module.exports = { insertSampleData }; 