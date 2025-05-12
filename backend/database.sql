-- Drop existing tables if they exist
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS books;

-- Create Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Restaurants table
CREATE TABLE restaurants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    cuisine_type VARCHAR(50),
    opening_hours TIME NOT NULL,
    closing_hours TIME NOT NULL,
    max_capacity INT NOT NULL DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Reservations table
CREATE TABLE reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    party_size INT NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Add indexes for better query performance
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_restaurant_location ON restaurants(location);
CREATE INDEX idx_reservation_date ON reservations(reservation_date);
CREATE INDEX idx_reservation_status ON reservations(status);

-- Insert sample restaurants
INSERT INTO restaurants (name, location, description, cuisine_type, opening_hours, closing_hours, max_capacity) VALUES
('La Bella Italia', 'Downtown Athens', 'Authentic Italian cuisine in the heart of Athens', 'Italian', '12:00', '23:00', 60),
('Souvlaki House', 'Kolonaki', 'Traditional Greek souvlaki and mezedes', 'Greek', '11:00', '00:00', 40),
('Sushi Master', 'Glyfada', 'Premium Japanese sushi and sashimi', 'Japanese', '13:00', '23:00', 30),
('The Grill House', 'Chalandri', 'Premium steaks and grilled specialties', 'Steakhouse', '17:00', '23:30', 50),
('Mediterranean Flavors', 'Piraeus', 'Fresh seafood and Mediterranean dishes', 'Mediterranean', '12:00', '23:00', 45); 