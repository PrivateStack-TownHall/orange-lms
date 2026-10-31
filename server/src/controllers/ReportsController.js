const { reportsService } = require("../services");

class ReportsController {
  static async getDashboard(req, res, next) {
    try {
      const data = await reportsService.getDashboard(req.query);

      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ReportsController;
