-- Create database
CREATE DATABASE IF NOT EXISTS ayurbot_db;
USE ayurbot_db;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    age INT,
    password_hash VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    otp VARCHAR(6),
    otp_expiry DATETIME,
    verification_token VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create prakriti_assessments table
CREATE TABLE prakriti_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    vata_score INT,
    pitta_score INT,
    kapha_score INT,
    dominant_dosha VARCHAR(20),
    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create chat_history table
CREATE TABLE chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    question TEXT,
    response TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Sample queries for managing users
-- Check if email exists
SELECT id FROM users WHERE email = ?;

-- Insert new user
INSERT INTO users (full_name, email, phone_number, age, password_hash, verified, otp, otp_expiry) 
VALUES (?, ?, ?, ?, ?, FALSE, ?, ?);

-- Verify OTP
SELECT id, otp, otp_expiry FROM users WHERE email = ? AND otp = ?;

-- Update user verification status
UPDATE users SET verified = TRUE, otp = '', otp_expiry = '' WHERE id = ?;

-- Login verification
SELECT full_name, password_hash FROM users WHERE email = ? AND verified = TRUE;

-- Store prakriti assessment
INSERT INTO prakriti_assessments (user_id, vata_score, pitta_score, kapha_score, dominant_dosha)
VALUES (?, ?, ?, ?, ?);

-- Store chat history
INSERT INTO chat_history (user_id, question, response)
VALUES (?, ?, ?);

-- Get user's chat history
SELECT question, response, timestamp 
FROM chat_history 
WHERE user_id = ? 
ORDER BY timestamp DESC;

-- Get user's latest prakriti assessment
SELECT * FROM prakriti_assessments 
WHERE user_id = ? 
ORDER BY assessment_date DESC 
LIMIT 1;
