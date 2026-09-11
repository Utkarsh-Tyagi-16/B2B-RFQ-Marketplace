/**
 * controllers/quotationController.js — Business logic for supplier quotations.
 * Handles submitting a new quotation and retrieving a supplier's own quotations.
 */

const Quotation = require('../models/Quotation');
const RFQ = require('../models/RFQ');

// POST /api/quotations
// Allows a supplier to submit a quotation for an open RFQ.
// Prevents duplicate submissions (same supplier, same RFQ).
const submitQuotation = async (req, res, next) => {
  try {
    const { rfqId, quotedPrice, estimatedDeliveryTime, message } = req.body;

    // Ensure the target RFQ exists and is still open
    const rfq = await RFQ.findById(rfqId);
    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found.' });
    }
    if (rfq.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This RFQ is closed and no longer accepting quotations.',
      });
    }

    // Suppliers cannot quote on their own non-existent buyer RFQs, but also
    // a buyer's rfq shouldn't be quoted by the same user if somehow roles mix.
    // The compound unique index on (rfqId, supplierId) in the Quotation model
    // handles duplicate prevention at the database level; we also check here
    // for a cleaner error message.
    const existing = await Quotation.findOne({ rfqId, supplierId: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a quotation for this RFQ.',
      });
    }

    const quotation = await Quotation.create({
      rfqId,
      supplierId: req.user._id,
      quotedPrice,
      estimatedDeliveryTime,
      message: message || '',
    });

    // Populate supplier info for the response
    await quotation.populate('supplierId', 'name email');
    await quotation.populate('rfqId', 'productOrServiceName');

    res.status(201).json({
      success: true,
      message: 'Quotation submitted successfully',
      data: { quotation },
    });
  } catch (error) {
    next(error);
  }
};


// GET /api/quotations/my
// Returns all quotations submitted by the currently logged-in supplier,
// including the related RFQ's name, location, and deadline for context.
const getMyQuotations = async (req, res, next) => {
  try {
    const quotations = await Quotation.find({ supplierId: req.user._id })
      .populate({
        path: 'rfqId',
        select: 'productOrServiceName deliveryLocation deadline status quantity',
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { quotations, count: quotations.length },
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/quotations/:id/accept
// Allows the RFQ owner (buyer) to accept a quotation.
// Automatically marks other quotations for that RFQ as rejected and closes the RFQ.
const acceptQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found.' });
    }

    const rfq = await RFQ.findById(quotation.rfqId);
    if (!rfq) {
      return res.status(404).json({ success: false, message: 'Associated RFQ not found.' });
    }

    // Only the buyer who created the RFQ can accept a quotation
    if (rfq.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to accept quotations for this RFQ.',
      });
    }

    // Mark this quotation as accepted
    quotation.status = 'accepted';
    await quotation.save();

    // Mark all other quotations for this RFQ as rejected
    await Quotation.updateMany(
      { rfqId: quotation.rfqId, _id: { $ne: quotation._id } },
      { status: 'rejected' }
    );

    // Close the RFQ now that a supplier has been awarded
    rfq.status = 'closed';
    await rfq.save();

    await quotation.populate('supplierId', 'name email');

    res.json({
      success: true,
      message: 'Quotation accepted successfully. The RFQ is now closed.',
      data: { quotation },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitQuotation, getMyQuotations, acceptQuotation };

