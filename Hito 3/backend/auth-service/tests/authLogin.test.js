const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth');
const bcrypt = require('bcryptjs');

// Mock User model
jest.mock('../models/user', () => ({
  findOne: jest.fn()
}));
const User = require('../models/user');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

beforeAll(() => {
  process.env.JWT_SECRET = 'testsecret';
});

test('logs in with correct credentials and returns token', async () => {
  const hashed = await bcrypt.hash('secure123', 10);

  User.findOne.mockResolvedValue({
    _id: 'user123',
    email: 'test@example.com',
    password: hashed
  });

  const res = await request(app).post('/auth/login').send({
    email: 'test@example.com',
    password: 'secure123'
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.token).toBeDefined();
});

test('fails if user not found', async () => {
  User.findOne.mockResolvedValue(null);

  const res = await request(app).post('/auth/login').send({
    email: 'missing@example.com',
    password: 'secure123'
  });

  expect(res.statusCode).toBe(404);
});

test('fails if password is incorrect', async () => {
  const hashed = await bcrypt.hash('secure123', 10);

  User.findOne.mockResolvedValue({
    _id: 'user123',
    email: 'test@example.com',
    password: hashed
  });

  const res = await request(app).post('/auth/login').send({
    email: 'test@example.com',
    password: 'wrongpass'
  });

  expect(res.statusCode).toBe(400);
});
