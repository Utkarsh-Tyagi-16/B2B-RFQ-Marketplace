/**
 * middleware/roleMiddleware.js — Role-based authorization middleware factory.
 * Returns a middleware that only allows users with the specified role to proceed.
 * Must be used AFTER authMiddleware (which populates req.user).
 *
 * Usage example:
 *   router.post('/rfqs', authMiddleware, roleMiddleware('buyer'), createRFQ);
 */

// Returns an Express middleware that restricts access to a specific role
const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      // Should not happen if authMiddleware runs first, but guard anyway
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only ${requiredRole}s can perform this action.`,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
