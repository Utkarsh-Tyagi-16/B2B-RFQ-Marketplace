/**
 * models/Quotation.js — Mongoose schema for supplier quotations on an RFQ.
 * Each quotation links a supplier to an RFQ with pricing and delivery info.
 */

const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema(
  {
    // The RFQ this quotation is responding to
    rfqId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RFQ',
      required: [true, 'RFQ ID is required'],
    },
    // The supplier submitting this quotation
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Supplier ID is required'],
    },
    quotedPrice: {
      type: Number,
      required: [true, 'Quoted price is required'],
      min: [0.01, 'Quoted price must be greater than 0'],
    },
    // Human-readable delivery estimate, e.g. "3-5 business days" or "2 weeks"
    estimatedDeliveryTime: {
      type: String,
      required: [true, 'Estimated delivery time is required'],
      trim: true,
    },
    // Optional message or notes from the supplier to the buyer
    message: {
      type: String,
      trim: true,
      default: '',
    },
    // Status of the quotation: 'pending', 'accepted', or 'rejected'
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index — one supplier can only submit one quotation per RFQ
quotationSchema.index({ rfqId: 1, supplierId: 1 }, { unique: true });

module.exports = mongoose.model('Quotation', quotationSchema);
