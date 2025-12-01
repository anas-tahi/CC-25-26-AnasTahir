const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth');

// Mock User model
jest.mock('../models/user', () => {
  const actual = jest.requireActual('mongoose');
  return Object.assign(function () {
    return { save: jest.fn().mockResolvedValue() };
  }, {
    findOne: jest.fn()
  });
});
const User = require('../models/user');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

test('registers a new user successfully', async () => {
  User.findOne.mockResolvedValue(null);

  const res = await request(app).post('/auth/register').send({
    name: 'Test User',              // ADDED name field
    email: 'test@example.com',
    password: 'secure123'
  });

  expect(res.statusCode).toBe(201);
  expect(res.body.message).toBe('User registered');
});

test('fails if email is missing', async () => {
  const res = await request(app).post('/auth/register').send({
    name: 'Test User',
    password: 'secure123'
  });

  expect(res.statusCode).toBe(400);
});

test('fails if password is missing', async () => {
  const res = await request(app).post('/auth/register').send({
    name: 'Test User',
    email: 'test@example.com'
  });

  expect(res.statusCode).toBe(400);
});

test('fails if email already exists', async () => {
  User.findOne.mockResolvedValue({ email: 'test@example.com' });

  const res = await request(app).post('/auth/register').send({
    name: 'Test User',
    email: 'test@example.com',
    password: 'secure123'
  });

  expect(res.statusCode).toBe(409);
});
