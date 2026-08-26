const { userActivityService } = require("../services");

class UserActivityController {
  static async getAll(req, res, next) {
    try {
      const result = await userActivityService.findAll(req.query);

      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getOverview(req, res, next) {
    try {
      const overview = await userActivityService.getOverview(req.query);

      res.json(overview);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserActivityController;
