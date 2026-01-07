// generateToken.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // make sure you have your JWT_SECRET in .env

// Replace with the actual user ID of the account you want to test
const userId = 'USER_ID_HERE';
const email = 'user@example.com'; // optional, only if you include email in your token

const token = jwt.sign(
  { id: userId, email }, // payload
  process.env.JWT_SECRET, // your secret from .env
  { expiresIn: '1h' } // new token valid for 1 hour (change as needed)
);

console.log('New JWT:', token);
