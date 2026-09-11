/**
 * test/middleware.test.js
 * Unit tests for backend middleware (authMiddleware, roleMiddleware, errorHandler, validate)
 * and utility functions (generateToken, User.toJSON).
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const errorHandler = require('../middleware/errorHandler');
const validate = require('../middleware/validate');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');
const { mockRequest, mockResponse } = require('./helpers');

// Ensure secret is present for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_12345';
process.env.JWT_EXPIRES_IN = '1d';

describe('Auth Middleware — Unit Tests', () => {
  let originalFindById;

  beforeEach(() => {
    originalFindById = User.findById;
  });

  afterEach(() => {
    User.findById = originalFindById;
  });

  it('should return 401 if Authorization header is missing', async () => {
    const req = mockRequest({ headers: {} });
    const res = mockResponse();
    let nextCalled = false;

    await authMiddleware(req, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 401);
    assert.equal(res.data.success, false);
    assert.match(res.data.message, /No token provided/);
    assert.equal(nextCalled, false);
  });

  it('should return 401 if Authorization header does not start with Bearer', async () => {
    const req = mockRequest({ headers: { authorization: 'Basic 12345' } });
    const res = mockResponse();
    let nextCalled = false;

    await authMiddleware(req, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 401);
    assert.equal(res.data.success, false);
    assert.match(res.data.message, /No token provided/);
    assert.equal(nextCalled, false);
  });

  it('should return 401 if token is invalid or corrupt', async () => {
    const req = mockRequest({ headers: { authorization: 'Bearer invalid.token.payload' } });
    const res = mockResponse();
    let nextCalled = false;

    await authMiddleware(req, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 401);
    assert.equal(res.data.success, false);
    assert.match(res.data.message, /Invalid token/);
    assert.equal(nextCalled, false);
  });

  it('should return 401 if token is expired', async () => {
    const expiredToken = jwt.sign({ id: 'user123' }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    const req = mockRequest({ headers: { authorization: `Bearer ${expiredToken}` } });
    const res = mockResponse();
    let nextCalled = false;

    await authMiddleware(req, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 401);
    assert.equal(res.data.success, false);
    assert.match(res.data.message, /Token expired/);
    assert.equal(nextCalled, false);
  });

  it('should return 401 if user in token no longer exists in DB', async () => {
    const validToken = jwt.sign({ id: 'user_deleted_id' }, process.env.JWT_SECRET);
    User.findById = async () => null;

    const req = mockRequest({ headers: { authorization: `Bearer ${validToken}` } });
    const res = mockResponse();
    let nextCalled = false;

    await authMiddleware(req, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 401);
    assert.equal(res.data.success, false);
    assert.match(res.data.message, /no longer exists/);
    assert.equal(nextCalled, false);
  });

  it('should attach user to req.user and call next() for valid token', async () => {
    const mockUserDoc = { _id: 'u100', name: 'John Buyer', role: 'buyer' };
    const validToken = jwt.sign({ id: 'u100' }, process.env.JWT_SECRET);
    User.findById = async (id) => (id === 'u100' ? mockUserDoc : null);

    const req = mockRequest({ headers: { authorization: `Bearer ${validToken}` } });
    const res = mockResponse();
    let nextCalled = false;

    await authMiddleware(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, true);
    assert.deepEqual(req.user, mockUserDoc);
  });
});

describe('Role Middleware — Unit Tests', () => {
  it('should return 401 if req.user is not set', () => {
    const checkBuyer = roleMiddleware('buyer');
    const req = mockRequest({ user: null });
    const res = mockResponse();
    let nextCalled = false;

    checkBuyer(req, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 401);
    assert.equal(res.data.success, false);
    assert.equal(nextCalled, false);
  });

  it('should return 403 if user does not have the required role', () => {
    const checkBuyer = roleMiddleware('buyer');
    const req = mockRequest({ user: { role: 'supplier' } });
    const res = mockResponse();
    let nextCalled = false;

    checkBuyer(req, res, () => { nextCalled = true; });

    assert.equal(res.statusCode, 403);
    assert.equal(res.data.success, false);
    assert.match(res.data.message, /Only buyers can perform this action/);
    assert.equal(nextCalled, false);
  });

  it('should call next() if user has the matching role', () => {
    const checkSupplier = roleMiddleware('supplier');
    const req = mockRequest({ user: { role: 'supplier' } });
    const res = mockResponse();
    let nextCalled = false;

    checkSupplier(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, true);
  });
});

describe('Error Handler Middleware — Unit Tests', () => {
  it('should format Mongoose ValidationError with 400 and list error messages', () => {
    const valErr = new Error('Validation failed');
    valErr.name = 'ValidationError';
    valErr.errors = {
      email: { message: 'Please enter a valid email' },
      password: { message: 'Password must be at least 6 characters' },
    };

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(valErr, req, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.equal(res.data.success, false);
    assert.equal(res.data.message, 'Validation failed');
    assert.deepEqual(res.data.errors, [
      'Please enter a valid email',
      'Password must be at least 6 characters',
    ]);
  });

  it('should format Mongoose Duplicate Key Error (code 11000) with 400', () => {
    const dupErr = new Error('E11000 duplicate key error');
    dupErr.code = 11000;
    dupErr.keyValue = { email: 'test@example.com' };

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(dupErr, req, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.equal(res.data.success, false);
    assert.match(res.data.message, /A record with this email already exists/);
  });

  it('should format Mongoose CastError with 400', () => {
    const castErr = new Error('Cast to ObjectId failed');
    castErr.name = 'CastError';
    castErr.path = '_id';

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(castErr, req, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.equal(res.data.success, false);
    assert.match(res.data.message, /Invalid value for field: _id/);
  });

  it('should format JsonWebTokenError with 401', () => {
    const jwtErr = new Error('jwt malformed');
    jwtErr.name = 'JsonWebTokenError';

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(jwtErr, req, res, () => {});

    assert.equal(res.statusCode, 401);
    assert.equal(res.data.message, 'Invalid token.');
  });

  it('should format TokenExpiredError with 401', () => {
    const expErr = new Error('jwt expired');
    expErr.name = 'TokenExpiredError';

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(expErr, req, res, () => {});

    assert.equal(res.statusCode, 401);
    assert.equal(res.data.message, 'Token expired. Please log in again.');
  });

  it('should default to status 500 and unexpected error message for generic errors', () => {
    const genericErr = new Error('Database disk full');

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(genericErr, req, res, () => {});

    assert.equal(res.statusCode, 500);
    assert.equal(res.data.success, false);
    assert.equal(res.data.message, 'Database disk full');
  });
});

describe('Validate Middleware — Unit Tests', () => {
  it('should call next() when express-validator reports no errors', () => {
    const req = mockRequest();
    // express-validator attaches results to req[expressValidatorKey] or req._validationErrors
    // When no errors exist, validationResult(req).isEmpty() returns true
    const res = mockResponse();
    let nextCalled = false;

    validate(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, true);
  });
});

describe('Utility & Model Methods — Unit Tests', () => {
  it('generateToken() should produce a valid JWT containing the userId', () => {
    const userId = 'user_abc_789';
    const token = generateToken(userId);

    assert.equal(typeof token, 'string');
    assert.ok(token.length > 20);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    assert.equal(decoded.id, userId);
  });

  it('User.toJSON() should strip passwordHash from returned object', () => {
    const userDoc = new User({
      name: 'Sample User',
      email: 'sample@example.com',
      passwordHash: '$2a$10$abcdefghijfakehashforunitest',
      role: 'buyer',
    });

    const json = userDoc.toJSON();
    assert.equal(json.name, 'Sample User');
    assert.equal(json.email, 'sample@example.com');
    assert.equal(json.role, 'buyer');
    assert.equal(json.passwordHash, undefined);
  });
});
