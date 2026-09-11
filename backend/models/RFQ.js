/**
 * models/RFQ.js — Mongoose schema for Request for Quotation documents.
 * An RFQ is created by a buyer and can receive multiple quotations from suppliers.
 */

const mongoose = require('mongoose');

const rfqSchema = new mongoose.Schema(
  {
    // The buyer who created this RFQ — required for ownership checks
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer ID is required'],
    },
    productOrServiceName: {
      type: String,
      required: [true, 'Product or service name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    deliveryLocation: {
      type: String,
      required: [true, 'Delivery location is required'],
      trim: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

// Text index for full-text search on product name and description
rfqSchema.index({ productOrServiceName: 'text', description: 'text' });

// Regular index for filtering by delivery location (case-insensitive)
rfqSchema.index({ deliveryLocation: 1 });

module.exports = mongoose.model('RFQ', rfqSchema);
