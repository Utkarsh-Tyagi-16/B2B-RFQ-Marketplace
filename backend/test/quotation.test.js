/**
 * test/quotation.test.js — Unit tests for quotation controller functions:
 * submitQuotation, getMyQuotations, acceptQuotation.
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const Quotation = require('../models/Quotation');
const RFQ = require('../models/RFQ');
const quotationController = require('../controllers/quotationController');
const { mockRequest, mockResponse } = require('./helpers');

describe('Quotation Controller — Unit Tests', () => {
  let origQuotationFindById;
  let origQuotationFindOne;
  let origQuotationFind;
  let origQuotationCreate;
  let origQuotationUpdateMany;
  let origRFQFindById;

  beforeEach(() => {
    origQuotationFindById = Quotation.findById;
    origQuotationFindOne = Quotation.findOne;
    origQuotationFind = Quotation.find;
    origQuotationCreate = Quotation.create;
    origQuotationUpdateMany = Quotation.updateMany;
    origRFQFindById = RFQ.findById;
  });

  afterEach(() => {
    Quotation.findById = origQuotationFindById;
    Quotation.findOne = origQuotationFindOne;
    Quotation.find = origQuotationFind;
    Quotation.create = origQuotationCreate;
    Quotation.updateMany = origQuotationUpdateMany;
    RFQ.findById = origRFQFindById;
  });

  describe('submitQuotation()', () => {
    it('should return 404 if target RFQ does not exist', async () => {
      RFQ.findById = async () => null;

      const req = mockRequest({
        body: { rfqId: 'nonexistent_rfq', quotedPrice: 1000 },
        user: { _id: 'supplier_123' },
      });
      const res = mockResponse();

      await quotationController.submitQuotation(req, res, () => {});

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'RFQ not found.');
    });

    it('should return 400 if target RFQ is closed', async () => {
      RFQ.findById = async () => ({ _id: 'rfq_123', status: 'closed' });

      const req = mockRequest({
        body: { rfqId: 'rfq_123', quotedPrice: 1000 },
        user: { _id: 'supplier_123' },
      });
      const res = mockResponse();

      await quotationController.submitQuotation(req, res, () => {});

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'This RFQ is closed and no longer accepting quotations.');
    });

    it('should return 400 if supplier has already submitted a quotation for this RFQ', async () => {
      RFQ.findById = async () => ({ _id: 'rfq_123', status: 'open' });
      Quotation.findOne = async () => ({ _id: 'existing_quote_id' });

      const req = mockRequest({
        body: { rfqId: 'rfq_123', quotedPrice: 1000 },
        user: { _id: 'supplier_123' },
      });
      const res = mockResponse();

      await quotationController.submitQuotation(req, res, () => {});

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'You have already submitted a quotation for this RFQ.');
    });

    it('should create quotation and return 201 for valid submission', async () => {
      RFQ.findById = async () => ({ _id: 'rfq_123', status: 'open' });
      Quotation.findOne = async () => null; // No prior quote
      Quotation.create = async (doc) => ({
        _id: 'new_quote_id',
        ...doc,
        populate: async () => {},
      });

      const req = mockRequest({
        body: {
          rfqId: 'rfq_123',
          quotedPrice: 15000,
          estimatedDeliveryTime: '7 days',
          message: 'Fast turnaround guaranteed',
        },
        user: { _id: 'supplier_123' },
      });
      const res = mockResponse();

      await quotationController.submitQuotation(req, res, () => {});

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.message, 'Quotation submitted successfully');
      assert.strictEqual(res.data.data.quotation.quotedPrice, 15000);
      assert.strictEqual(res.data.data.quotation.supplierId, 'supplier_123');
    });
  });

  describe('getMyQuotations()', () => {
    it('should return all quotations submitted by the logged-in supplier', async () => {
      const supplierId = 'supplier_123';
      const mockQuotes = [
        { _id: 'q_1', quotedPrice: 2000, supplierId },
        { _id: 'q_2', quotedPrice: 3500, supplierId },
      ];

      Quotation.find = (query) => {
        assert.strictEqual(query.supplierId, supplierId);
        return {
          populate: () => ({
            sort: async () => mockQuotes,
          }),
        };
      };

      const req = mockRequest({ user: { _id: supplierId } });
      const res = mockResponse();

      await quotationController.getMyQuotations(req, res, () => {});

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.data.count, 2);
      assert.deepStrictEqual(res.data.data.quotations, mockQuotes);
    });
  });

  describe('acceptQuotation()', () => {
    it('should return 404 if quotation not found', async () => {
      Quotation.findById = async () => null;

      const req = mockRequest({ params: { id: 'missing_q' }, user: { _id: 'buyer_123' } });
      const res = mockResponse();

      await quotationController.acceptQuotation(req, res, () => {});

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.data.message, 'Quotation not found.');
    });

    it('should return 403 if a non-owner buyer tries to accept quotation', async () => {
      Quotation.findById = async () => ({
        _id: 'q_1',
        rfqId: 'rfq_123',
      });
      RFQ.findById = async () => ({
        _id: 'rfq_123',
        buyerId: { toString: () => 'actual_owner_id' },
      });

      const req = mockRequest({
        params: { id: 'q_1' },
        user: { _id: { toString: () => 'malicious_buyer_id' } },
      });
      const res = mockResponse();

      await quotationController.acceptQuotation(req, res, () => {});

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.data.message, 'You are not authorized to accept quotations for this RFQ.');
    });

    it('should mark quotation accepted, reject others, and close the RFQ', async () => {
      let otherQuotesRejected = false;
      const mockQuotation = {
        _id: 'q_1',
        rfqId: 'rfq_123',
        status: 'pending',
        async save() { return this; },
        populate: async () => {},
      };
      const mockRFQ = {
        _id: 'rfq_123',
        buyerId: { toString: () => 'buyer_owner_id' },
        status: 'open',
        async save() { return this; },
      };

      Quotation.findById = async () => mockQuotation;
      RFQ.findById = async () => mockRFQ;
      Quotation.updateMany = async (filter, update) => {
        if (filter.rfqId === 'rfq_123' && update.status === 'rejected') {
          otherQuotesRejected = true;
        }
      };

      const req = mockRequest({
        params: { id: 'q_1' },
        user: { _id: { toString: () => 'buyer_owner_id' } },
      });
      const res = mockResponse();

      await quotationController.acceptQuotation(req, res, () => {});

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(mockQuotation.status, 'accepted');
      assert.strictEqual(mockRFQ.status, 'closed');
      assert.strictEqual(otherQuotesRejected, true, 'Other bids should be rejected');
      assert.ok(res.data.message.includes('RFQ is now closed'));
    });
  });
});
