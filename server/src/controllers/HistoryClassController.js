const { historyClassService } = require("../services");

class HistoryClassController {
  static async getAll(req, res, next) {
    try {
      const histories = await historyClassService.findAll();

      res.status(200).json(histories);
    } catch (error) {
      next(error);
    }
  }

  static async getSummary(req, res, next) {
    try {
      const summary = await historyClassService.getSummary();

      res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const history = await historyClassService.findById(req.params.id);

      res.status(200).json(history);
    } catch (error) {
      next(error);
    }
  }

  static async archive(req, res, next) {
    try {
      const result = await historyClassService.archive(
        req.params.classId,
        req.user,
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async restore(req, res, next) {
    try {
      const result = await historyClassService.restore(req.params.id, req.user);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await historyClassService.delete(req.params.id, req.user);

      res.status(200).json({
        message: "History deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HistoryClassController;
