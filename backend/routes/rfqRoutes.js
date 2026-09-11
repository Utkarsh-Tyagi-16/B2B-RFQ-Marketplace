/**
 * routes/rfqRoutes.js — Maps all RFQ-related HTTP endpoints to controllers.
 * Routes are protected by authMiddleware and roleMiddleware where appropriate.
 *
 * IMPORTANT: The route /api/rfqs/my MUST be defined before /api/rfqs/:id
 * because Express matches routes in order — if /:id comes first, Express
 * would treat "my" as an ID and attempt a MongoDB ObjectId lookup which fails.
 */

const express = require('express');
const { body, query } = require('express-validator');
const {
  createRFQ,
  getMyRFQs,
  updateRFQ,
  deleteRFQ,
  getAllRFQs,
  getRFQById,
  getRFQQuotations,
} = require('../controllers/rfqController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// All routes below require authentication
router.use(authMiddleware);

// ── Buyer-only routes ──────────────────────────────────────────────────────

// GET /api/rfqs/my — list RFQs belonging to the logged-in buyer
// MUST be before /:id to avoid "my" being treated as a Mongo ObjectId
router.get('/my', roleMiddleware('buyer'), getMyRFQs);

// POST /api/rfqs — create a new RFQ
router.post(
  '/',
  roleMiddleware('buyer'),
  [
    body('productOrServiceName')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Product/service name must be at least 3 characters'),
    body('description')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Description must be at least 10 characters'),
    body('quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('deliveryLocation')
      .trim()
      .notEmpty()
      .withMessage('Delivery location is required'),
    body('deadline')
      .isISO8601()
      .withMessage('Deadline must be a valid date')
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error('Deadline must be a future date');
        }
        return true;
      }),
  ],
  validate,
  createRFQ
);

// ── Supplier-only routes ──────────────────────────────────────────────────

// GET /api/rfqs — browse all open RFQs with optional search/filter
router.get('/', roleMiddleware('supplier'), getAllRFQs);

// ── Mixed routes (both roles, with ownership checks inside controllers) ───

// GET /api/rfqs/:id — full RFQ detail (supplier views, buyer can too)
router.get('/:id', getRFQById);

// PUT /api/rfqs/:id — edit an RFQ (buyer owner only, checked in controller)
router.put(
  '/:id',
  roleMiddleware('buyer'),
  [
    body('productOrServiceName')
      .optional()
      .trim()
      .isLength({ min: 3 })
      .withMessage('Product/service name must be at least 3 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage('Description must be at least 10 characters'),
    body('quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('deadline')
      .optional()
      .isISO8601()
      .withMessage('Deadline must be a valid date')
      .custom((value) => {
        if (value && new Date(value) <= new Date()) {
          throw new Error('Deadline must be a future date');
        }
        return true;
      }),
  ],
  validate,
  updateRFQ
);

// DELETE /api/rfqs/:id — close an RFQ (buyer owner only, checked in controller)
router.delete('/:id', roleMiddleware('buyer'), deleteRFQ);

// GET /api/rfqs/:id/quotations — view all quotations for an RFQ (buyer owner only)
router.get('/:id/quotations', roleMiddleware('buyer'), getRFQQuotations);

module.exports = router;
