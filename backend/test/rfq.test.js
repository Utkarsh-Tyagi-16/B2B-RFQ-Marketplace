/**
 * test/rfq.test.js — Unit tests for RFQ controller functions:
 * createRFQ, getMyRFQs, updateRFQ, deleteRFQ, getAllRFQs, getRFQById, getRFQQuotations.
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const RFQ = require('../models/RFQ');
const Quotation = require('../models/Quotation');
const rfqController = require('../controllers/rfqController');
const { mockRequest, mockResponse } = require('./helpers');

describe('RFQ Controller — Unit Tests', () => {
  let origRFQCreate;
  let origRFQFind;
  let origRFQFindById;
  let origQuotationFind;

  beforeEach(() => {
    origRFQCreate = RFQ.create;
    origRFQFind = RFQ.find;
    origRFQFindById = RFQ.findById;
    origQuotationFind = Quotation.find;
  });

  afterEach(() => {
    RFQ.create = origRFQCreate;
    RFQ.find = origRFQFind;
    RFQ.findById = origRFQFindById;
    Quotation.find = origQuotationFind;
  });

  describe('createRFQ()', () => {
    it('should create an RFQ with status "open" linked to the authenticated buyer', async () => {
      const buyerId = 'buyer_123';
      RFQ.create = async (doc) => ({
        _id: 'rfq_abc',
        ...doc,
        createdAt: new Date(),
      });

      const req = mockRequest({
        user: { _id: buyerId, role: 'buyer' },
        body: {
          productOrServiceName: 'Hydraulic Valves',
          description: 'High pressure industrial valves for machinery',
          quantity: 50,
          deliveryLocation: 'Delhi, India',
          deadline: '2026-10-15',
        },
      });
      const res = mockResponse();

      await rfqController.createRFQ(req, res, () => {});

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.data.rfq.productOrServiceName, 'Hydraulic Valves');
      assert.strictEqual(res.data.data.rfq.buyerId, buyerId);
      assert.strictEqual(res.data.data.rfq.status, 'open');
    });
  });

  describe('getMyRFQs()', () => {
    it('should return all RFQs belonging to the authenticated buyer', async () => {
      const buyerId = 'buyer_123';
      const mockRFQs = [
        { _id: 'rfq_1', productOrServiceName: 'Item 1', buyerId },
        { _id: 'rfq_2', productOrServiceName: 'Item 2', buyerId },
      ];

      RFQ.find = (query) => {
        assert.strictEqual(query.buyerId, buyerId);
        return {
          sort: async () => mockRFQs,
        };
      };

      const req = mockRequest({ user: { _id: buyerId } });
      const res = mockResponse();

      await rfqController.getMyRFQs(req, res, () => {});

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.data.count, 2);
      assert.deepStrictEqual(res.data.data.rfqs, mockRFQs);
    });
  });

  describe('updateRFQ()', () => {
    it('should return 404 if RFQ does not exist', async () => {
      RFQ.findById = async () => null;

      const req = mockRequest({
        params: { id: 'nonexistent_rfq' },
        user: { _id: 'buyer_123' },
        body: { quantity: 100 },
      });
      const res = mockResponse();

      await rfqController.updateRFQ(req, res, () => {});

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'RFQ not found.');
    });

    it('should return 403 if another buyer tries to update someone else’s RFQ', async () => {
      RFQ.findById = async () => ({
        _id: 'rfq_abc',
        buyerId: { toString: () => 'original_buyer_id' },
      });

      const req = mockRequest({
        params: { id: 'rfq_abc' },
        user: { _id: { toString: () => 'attacker_buyer_id' } },
        body: { quantity: 999 },
      });
      const res = mockResponse();

      await rfqController.updateRFQ(req, res, () => {});

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.data.success, false);
      assert.strictEqual(res.data.message, 'You are not authorized to edit this RFQ.');
    });

    it('should update allowed fields when requested by the owner', async () => {
      const mockDoc = {
        _id: 'rfq_abc',
        buyerId: { toString: () => 'buyer_123' },
        productOrServiceName: 'Old Name',
        quantity: 10,
        async save() { return this; },
      };
      RFQ.findById = async () => mockDoc;

      const req = mockRequest({
        params: { id: 'rfq_abc' },
        user: { _id: { toString: () => 'buyer_123' } },
        body: { productOrServiceName: 'New Updated Name', quantity: 75 },
      });
      const res = mockResponse();

      await rfqController.updateRFQ(req, res, () => {});

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.data.rfq.productOrServiceName, 'New Updated Name');
      assert.strictEqual(res.data.data.rfq.quantity, 75);
    });
  });

  describe('deleteRFQ()', () => {
    it('should return 403 if non-owner attempts to soft-delete the RFQ', async () => {
      RFQ.findById = async () => ({
        _id: 'rfq_abc',
        buyerId: { toString: () => 'owner_id' },
      });

      const req = mockRequest({
        params: { id: 'rfq_abc' },
        user: { _id: { toString: () => 'other_user_id' } },
      });
      const res = mockResponse();

      await rfqController.deleteRFQ(req, res, () => {});

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.data.message, 'You are not authorized to delete this RFQ.');
    });

    it('should soft-delete RFQ by setting status to "closed"', async () => {
      const mockDoc = {
        _id: 'rfq_abc',
        buyerId: { toString: () => 'owner_id' },
        status: 'open',
        async save() { return this; },
      };
      RFQ.findById = async () => mockDoc;

      const req = mockRequest({
        params: { id: 'rfq_abc' },
        user: { _id: { toString: () => 'owner_id' } },
      });
      const res = mockResponse();

      await rfqController.deleteRFQ(req, res, () => {});

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(mockDoc.status, 'closed');
      assert.strictEqual(res.data.message, 'RFQ closed successfully');
    });
  });

  describe('getAllRFQs()', () => {
    it('should filter only open RFQs and support search & location filters', async () => {
      let capturedFilter = null;
      RFQ.find = (filter) => {
        capturedFilter = filter;
        return {
          populate: () => ({
            sort: async () => [{ _id: 'rfq_1', productOrServiceName: 'Steel Bolts', status: 'open' }],
          }),
        };
      };

      const req = mockRequest({
        query: { search: 'Steel', location: 'Mumbai' },
      });
      const res = mockResponse();

      await rfqController.getAllRFQs(req, res, () => {});

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(capturedFilter.status, 'open');
      assert.ok(capturedFilter.productOrServiceName.$regex, 'Search regex applied');
      assert.ok(capturedFilter.deliveryLocation.$regex, 'Location regex applied');
      assert.strictEqual(res.data.data.count, 1);
    });
  });

  describe('getRFQById()', () => {
    it('should return 404 when RFQ is not found', async () => {
      RFQ.findById = () => ({
        populate: async () => null,
      });

      const req = mockRequest({ params: { id: 'missing_id' } });
      const res = mockResponse();

      await rfqController.getRFQById(req, res, () => {});

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.data.message, 'RFQ not found.');
    });

    it('should return 200 and the RFQ document when found', async () => {
      const mockDoc = { _id: 'rfq_123', productOrServiceName: 'Electric Motor' };
      RFQ.findById = () => ({
        populate: async () => mockDoc,
      });

      const req = mockRequest({ params: { id: 'rfq_123' } });
      const res = mockResponse();

      await rfqController.getRFQById(req, res, () => {});

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.data.rfq.productOrServiceName, 'Electric Motor');
    });
  });

  describe('getRFQQuotations()', () => {
    it('should return 403 if non-owner tries to inspect quotations for an RFQ', async () => {
      RFQ.findById = async () => ({
        _id: 'rfq_123',
        buyerId: { toString: () => 'buyer_owner' },
      });

      const req = mockRequest({
        params: { id: 'rfq_123' },
        user: { _id: { toString: () => 'unauthorized_buyer' } },
      });
      const res = mockResponse();

      await rfqController.getRFQQuotations(req, res, () => {});

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.data.message, 'You are not authorized to view quotations for this RFQ.');
    });

    it('should return received quotations when requested by the RFQ owner', async () => {
      const mockRFQ = {
        _id: 'rfq_123',
        productOrServiceName: 'Custom Sheet Metal',
        buyerId: { toString: () => 'buyer_owner' },
      };
      const mockQuotes = [
        { _id: 'quote_1', quotedPrice: 5000 },
        { _id: 'quote_2', quotedPrice: 4800 },
      ];

      RFQ.findById = async () => mockRFQ;
      Quotation.find = () => ({
        populate: () => ({
          sort: async () => mockQuotes,
        }),
      });

      const req = mockRequest({
        params: { id: 'rfq_123' },
        user: { _id: { toString: () => 'buyer_owner' } },
      });
      const res = mockResponse();

      await rfqController.getRFQQuotations(req, res, () => {});

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.data.count, 2);
      assert.deepStrictEqual(res.data.data.quotations, mockQuotes);
    });
  });
});
