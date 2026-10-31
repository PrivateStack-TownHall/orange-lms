const permissions = require("../config/permission");

const authorization = (resource, action) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new Error("Unauthorized");
      }

      const allowedRoles = permissions?.[resource]?.[action];

      if (!allowedRoles) {
        throw new Error(`Permission not defined for ${resource}.${action}`);
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new Error("Forbidden");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = authorization;
