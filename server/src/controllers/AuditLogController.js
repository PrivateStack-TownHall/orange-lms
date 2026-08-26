const { auditLogService } = require("../services");

class AuditLogController {
  static async getAll(req, res, next) {
    try {
      const result = await auditLogService.findAll(req.query);

      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getOverview(req, res, next) {
    try {
      const overview = await auditLogService.getOverview(req.query);

      res.json(overview);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuditLogController;
