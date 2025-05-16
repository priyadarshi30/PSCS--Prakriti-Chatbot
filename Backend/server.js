const express = require('express');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // your MySQL password
  database: 'ayurbot_db'
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { full_name, email, phone_number, age, password } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await pool.getConnection();
    
    try {
      // Check if email already exists
      const [existingUser] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Insert new user
      const [result] = await connection.query(
        'INSERT INTO users (full_name, email, phone_number, age, password_hash, verified, otp, otp_expiry, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [full_name, email, phone_number, age, hashedPassword, 0, otp, new Date(Date.now() + 10*60*1000)]
      );

      // Send OTP email
      await transporter.sendMail({
        to: email,
        subject: 'Email Verification',
        text: `Your OTP is: ${otp}`
      });

      res.json({ success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// OTP verification endpoint
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.query(
        'SELECT * FROM users WHERE email = ? AND otp = ? AND otp_expiry > NOW()',
        [email, otp]
      );

      if (users.length > 0) {
        await connection.query(
          'UPDATE users SET verified = 1, otp = NULL, otp_expiry = NULL WHERE email = ?',
          [email]
        );
        res.json({ success: true });
      } else {
        res.status(400).json({ message: 'Invalid OTP' });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Verification failed' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.query(
        'SELECT * FROM users WHERE email = ? AND verified = 1',
        [email]
      );

      if (users.length > 0 && await bcrypt.compare(password, users[0].password_hash)) {
        const token = jwt.sign({ userId: users[0].id }, 'your-secret-key');
        res.json({ success: true, token });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
