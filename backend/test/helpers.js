/**
 * test/helpers.js — Lightweight mock utilities for unit testing Express controllers & middleware.
 */

function mockRequest(options = {}) {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...options,
  };
}

function mockResponse() {
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(payload) {
      res.data = payload;
      return res;
    },
  };
  return res;
}

module.exports = {
  mockRequest,
  mockResponse,
};
