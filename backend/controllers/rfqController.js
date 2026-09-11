/**
 * controllers/rfqController.js — All business logic for RFQ CRUD operations.
 * Buyers manage their own RFQs; suppliers can browse and view open RFQs.
 */

const RFQ = require('../models/RFQ');

// POST /api/rfqs
// Creates a new RFQ document owned by the logged-in buyer.
const createRFQ = async (req, res, next) => {
  try {
    const { productOrServiceName, description, quantity, deliveryLocation, deadline } = req.body;

    const rfq = await RFQ.create({
      buyerId: req.user._id,
      productOrServiceName,
      description,
      quantity,
      deliveryLocation,
      deadline: new Date(deadline),
      status: 'open',
    });

    res.status(201).json({
      success: true,
      message: 'RFQ created successfully',
      data: { rfq },
    });
  } catch (error) {
    next(error);
  }
};


// GET /api/rfqs/my
// Returns all RFQs created by the currently logged-in buyer, newest first.

const getMyRFQs = async (req, res, next) => {
  try {
    const rfqs = await RFQ.find({ buyerId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { rfqs, count: rfqs.length },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/rfqs/:id
// Updates an existing RFQ — only the RFQ's owner buyer may edit it.

const updateRFQ = async (req, res, next) => {
  try {
    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found.' });
    }

    // Ownership check — compare ObjectIds as strings
    if (rfq.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this RFQ.',
      });
    }

    const allowedFields = ['productOrServiceName', 'description', 'quantity', 'deliveryLocation', 'deadline', 'status'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        rfq[field] = req.body[field];
      }
    });

    const updatedRFQ = await rfq.save();

    res.json({
      success: true,
      message: 'RFQ updated successfully',
      data: { rfq: updatedRFQ },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/rfqs/:id
// Soft-closes (sets status to "closed") an RFQ — only its owner buyer may do this.

const deleteRFQ = async (req, res, next) => {
  try {
    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found.' });
    }

    // Ownership check
    if (rfq.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this RFQ.',
      });
    }

    // Soft delete — mark as closed rather than removing from DB
    // This preserves historical data and existing quotations
    rfq.status = 'closed';
    await rfq.save();

    res.json({
      success: true,
      message: 'RFQ closed successfully',
      data: { rfq },
    });
  } catch (error) {
    next(error);
  }
};


// GET /api/rfqs
// Returns all open RFQs for suppliers to browse.
// Supports query params: search (product name), location, deadlineFrom, deadlineTo.

const getAllRFQs = async (req, res, next) => {
  try {
    const { search, location, deadlineFrom, deadlineTo } = req.query;

    // Build a dynamic filter object — always filter to open RFQs only
    const filter = { status: 'open' };

    // Text search on productOrServiceName (case-insensitive regex)
    if (search && search.trim()) {
      filter.productOrServiceName = { $regex: search.trim(), $options: 'i' };
    }

    // Filter by delivery location (case-insensitive partial match)
    if (location && location.trim()) {
      filter.deliveryLocation = { $regex: location.trim(), $options: 'i' };
    }

    // Deadline range filter
    if (deadlineFrom || deadlineTo) {
      filter.deadline = {};
      if (deadlineFrom) filter.deadline.$gte = new Date(deadlineFrom);
      if (deadlineTo) filter.deadline.$lte = new Date(deadlineTo);
    }

    const rfqs = await RFQ.find(filter)
      .populate('buyerId', 'name email') // Include buyer name for display
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { rfqs, count: rfqs.length },
    });
  } catch (error) {
    next(error);
  }
};


// GET /api/rfqs/:id
// Returns full details of a single RFQ by ID (for supplier's detail view).

const getRFQById = async (req, res, next) => {
  try {
    const rfq = await RFQ.findById(req.params.id).populate('buyerId', 'name email');

    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found.' });
    }

    res.json({
      success: true,
      data: { rfq },
    });
  } catch (error) {
    next(error);
  }
};


// GET /api/rfqs/:id/quotations
// Returns all quotations for a specific RFQ — only visible to the RFQ's buyer owner.

const getRFQQuotations = async (req, res, next) => {
  try {
    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({ success: false, message: 'RFQ not found.' });
    }

    // Ownership check — only the buyer who owns this RFQ can view its quotations
    if (rfq.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view quotations for this RFQ.',
      });
    }

    const Quotation = require('../models/Quotation');
    const quotations = await Quotation.find({ rfqId: req.params.id })
      .populate('supplierId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { quotations, rfq, count: quotations.length },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRFQ,
  getMyRFQs,
  updateRFQ,
  deleteRFQ,
  getAllRFQs,
  getRFQById,
  getRFQQuotations,
};
