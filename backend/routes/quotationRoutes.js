/**
 * routes/quotationRoutes.js — Maps quotation endpoints to controller functions.
 * All routes require authentication; only suppliers may access them.
 *
 * IMPORTANT: GET /my must be before any parameterized routes to ensure
 * "my" is not interpreted as a MongoDB ObjectId.
 */

const express = require('express');
const { body } = require('express-validator');
const { submitQuotation, getMyQuotations, acceptQuotation } = require('../controllers/quotationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// All quotation routes require a valid JWT
router.use(authMiddleware);

// ── GET /api/quotations/my — list this supplier's submitted quotations ──────
router.get('/my', roleMiddleware('supplier'), getMyQuotations);

// ── POST /api/quotations — submit a new quotation for an RFQ (supplier only) ─
router.post(
  '/',
  roleMiddleware('supplier'),
  [
    body('rfqId').notEmpty().isMongoId().withMessage('A valid RFQ ID is required'),
    body('quotedPrice')
      .isFloat({ min: 0.01 })
      .withMessage('Quoted price must be greater than 0'),
    body('estimatedDeliveryTime')
      .trim()
      .notEmpty()
      .withMessage('Estimated delivery time is required'),
  ],
  validate,
  submitQuotation
);

// ── PATCH /api/quotations/:id/accept — accept a quotation (buyer only) ───────
router.patch('/:id/accept', roleMiddleware('buyer'), acceptQuotation);

module.exports = router;
