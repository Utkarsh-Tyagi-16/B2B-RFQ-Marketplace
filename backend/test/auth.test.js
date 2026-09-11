/**
 * test/auth.test.js — Unit tests for authentication controller functions:
 * signup, login, and getMe.
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authController = require('../controllers/authController');
const { mockRequest, mockResponse } = require('./helpers');

// Ensure JWT_SECRET is set for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';

describe('Auth Controller — Unit Tests', () => {
  let origUserFindOne;
  let origUserCreate;
  let origBcryptHash;
  let origBcryptCompare;

  beforeEach(() => {
    origUserFindOne = User.findOne;
    origUserCreate = User.create;
    origBcryptHash = bcrypt.hash;
    origBcryptCompare = bcrypt.compare;
  });

  afterEach(() => {
    User.findOne = origUserFindOne;
    User.create = origUserCreate;
    bcrypt.hash = origBcryptHash;
    bcrypt.compare = origBcryptCompare;
  });

  describe('signup()', () => {
    it('should return 400 if user with email already exists', async () => {
      User.findOne = async () => ({ _id: 'existing_id', email: 'test@example.com' });

      const req = mockRequest({
        body: {
          name: 'Existing User',
          email: 'test@example.com',
          password: 'Password123!',
          role: 'buyer',
        },
      });
      const res = mockResponse();
      let nextCalled = false;

      await authController.signup(req, res, () => { nextCalled = true; });

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'An account with this email already exists.');
      assert.strictEqual(nextCalled, false);
    });

    it('should hash password, create user, and return 201 with JWT token', async () => {
      User.findOne = async () => null; // No existing user
      bcrypt.hash = async (pw) => `hashed_${pw}`;
      User.create = async (doc) => ({
        _id: 'new_user_id',
        name: doc.name,
        email: doc.email,
        role: doc.role,
        passwordHash: doc.passwordHash,
      });

      const req = mockRequest({
        body: {
          name: 'New Buyer',
          email: 'buyer@example.com',
          password: 'Password123!',
          role: 'buyer',
        },
      });
      const res = mockResponse();

      await authController.signup(req, res, () => {});

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.message, 'Account created successfully');
      assert.ok(res.data.data.token, 'Token should be returned');
      assert.strictEqual(res.data.data.user.name, 'New Buyer');
      assert.strictEqual(res.data.data.user.email, 'buyer@example.com');
    });

    it('should forward database errors to next()', async () => {
      const dbError = new Error('Database connection crashed');
      User.findOne = async () => { throw dbError; };

      const req = mockRequest({ body: { email: 'fail@example.com' } });
      const res = mockResponse();
      let passedError = null;

      await authController.signup(req, res, (err) => { passedError = err; });

      assert.strictEqual(passedError, dbError);
    });
  });

  describe('login()', () => {
    it('should return 401 if user email is not found', async () => {
      User.findOne = () => ({
        select: async () => null,
      });

      const req = mockRequest({
        body: { email: 'nonexistent@example.com', password: 'Password123!' },
      });
      const res = mockResponse();

      await authController.login(req, res, () => {});

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'Invalid email or password.');
    });

    it('should return 401 if password does not match', async () => {
      User.findOne = () => ({
        select: async () => ({
          _id: 'user_123',
          email: 'user@example.com',
          passwordHash: 'real_hash',
        }),
      });
      bcrypt.compare = async () => false; // Password mismatch

      const req = mockRequest({
        body: { email: 'user@example.com', password: 'WrongPassword' },
      });
      const res = mockResponse();

      await authController.login(req, res, () => {});

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'Invalid email or password.');
    });

    it('should return 200 with token and user on successful login', async () => {
      const mockUser = {
        _id: 'user_123',
        name: 'Valid User',
        email: 'user@example.com',
        role: 'supplier',
        passwordHash: 'real_hash',
      };
      User.findOne = () => ({
        select: async () => mockUser,
      });
      bcrypt.compare = async () => true; // Password matched

      const req = mockRequest({
        body: { email: 'user@example.com', password: 'Password123!' },
      });
      const res = mockResponse();

      await authController.login(req, res, () => {});

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.message, 'Logged in successfully');
      assert.ok(res.data.data.token, 'Token should be returned');
      assert.strictEqual(res.data.data.user.email, 'user@example.com');
    });
  });

  describe('getMe()', () => {
    it('should return the authenticated user from req.user', async () => {
      const authenticatedUser = { _id: 'user_999', name: 'Auth User', role: 'buyer' };
      const req = mockRequest({ user: authenticatedUser });
      const res = mockResponse();

      await authController.getMe(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.deepStrictEqual(res.data.data.user, authenticatedUser);
    });
  });
});
