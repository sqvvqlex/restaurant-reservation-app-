-- Create database
DROP DATABASE IF EXISTS restaurant_reservation;
CREATE DATABASE restaurant_reservation;
USE restaurant_reservation;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    reset_token VARCHAR(64),
    reset_token_expires DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index for users
CREATE INDEX idx_reset_token ON users(reset_token);

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    cuisine_type VARCHAR(50) NOT NULL,
    opening_hours TIME NOT NULL,
    closing_hours TIME NOT NULL,
    max_capacity INT NOT NULL,
    description TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for restaurants
CREATE INDEX idx_restaurant_location ON restaurants(location);
CREATE INDEX idx_restaurant_cuisine ON restaurants(cuisine_type);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    party_size INT NOT NULL,
    status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    CONSTRAINT valid_party_size CHECK (party_size > 0 AND party_size <= 20)
);

-- Create indexes for reservations
CREATE INDEX idx_reservation_date ON reservations(date);
CREATE INDEX idx_user_reservations ON reservations(user_id, status);

-- Sample data for restaurants
INSERT INTO restaurants (name, location, cuisine_type, opening_hours, closing_hours, max_capacity, description, rating) VALUES
('La Piazza', 'Downtown', 'Italian', '11:00', '23:00', 80, 'Authentic Italian cuisine in a cozy atmosphere', 4.5),
('Sakura', 'Westside', 'Japanese', '12:00', '22:00', 60, 'Traditional Japanese sushi and ramen', 4.7),
('El Mariachi', 'Eastside', 'Mexican', '11:30', '22:30', 70, 'Vibrant Mexican restaurant with live music', 4.3),
('The Golden Dragon', 'Chinatown', 'Chinese', '11:00', '23:30', 100, 'Authentic Chinese cuisine with dim sum specialties', 4.4),
('Le Bistro', 'French Quarter', 'French', '17:00', '23:00', 50, 'Elegant French dining experience', 4.8); 