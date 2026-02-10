const AuditLog = require('../models/AuditLog');

// Audit middleware for logging database mutations
const auditMiddleware = (action, resource) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to capture response
    res.json = async (data) => {
      try {
        // Only log if user is authenticated
        if (req.user) {
          const auditData = {
            userId: req.user.id,
            action: action,
            resource: resource,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            timestamp: new Date()
          };

          // Add resource ID if available
          if (req.params.id) {
            auditData.resourceId = req.params.id;
          }

          // Add data based on action type
          if (action === 'CREATE') {
            auditData.newData = req.body;
            auditData.description = `Created new ${resource}`;
          } else if (action === 'UPDATE') {
            auditData.oldData = req.originalData || null; // Would need to fetch original data before update
            auditData.newData = req.body;
            auditData.description = `Updated ${resource} ${req.params.id || ''}`;
          } else if (action === 'DELETE') {
            auditData.oldData = req.originalData || null;
            auditData.description = `Deleted ${resource} ${req.params.id || ''}`;
          }

          // Create audit log
          await AuditLog.create(auditData);
        }
      } catch (error) {
        console.error('Audit logging error:', error);
        // Don't block the response if audit logging fails
      }

      // Call original json method
      return originalJson(data);
    };

    next();
  };
};

// Middleware to capture original data before update/delete
const captureOriginalData = (Model) => {
  return async (req, res, next) => {
    if (req.params.id) {
      try {
        const originalData = await Model.findById(req.params.id);
        if (originalData) {
          req.originalData = originalData.toObject();
        }
      } catch (error) {
        console.error('Error capturing original data:', error);
      }
    }
    next();
  };
};

module.exports = { auditMiddleware, captureOriginalData };
