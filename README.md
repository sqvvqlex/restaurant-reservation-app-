# Restaurant Reservation Mobile App

A mobile application for restaurant reservations built with React Native and Node.js. This project was developed as part of the Mobile & Distributed Systems course.

## Features

- User Authentication (Login/Register)
- Browse Restaurants
- Search and Filter Restaurants
- Make Restaurant Reservations
- View and Manage Reservations
- Real-time Updates

## Tech Stack

- **Frontend**: React Native, TypeScript
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT

## Project Structure

```
.
├── backend/           # Node.js backend server
├── RestaurantReservationApp/  # React Native mobile app
└── src/              # Source code
```

## Setup Instructions

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../RestaurantReservationApp
npm install
```

3. Start the backend server:
```bash
cd backend
npm start
```

4. Start the React Native app:
```bash
cd RestaurantReservationApp
npm start
```

## Environment Variables

Make sure to set up the following environment variables:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `PORT`: Backend server port (default: 3000)

## API Documentation

The backend provides the following API endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `POST /api/reservations` - Create reservation
- `GET /api/reservations` - Get user reservations
- `DELETE /api/reservations/:id` - Cancel reservation

## Contributing

This project was created for educational purposes as part of the Mobile & Distributed Systems course. 