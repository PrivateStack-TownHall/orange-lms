const { taskCriteriaService } = require("../services");

class TaskCriteriaController {
  static async create(req, res, next) {
    try {
      const criteria = await taskCriteriaService.create(req.user, req.body);

      res.status(201).json(criteria);
    } catch (error) {
      next(error);
    }
  }

  static async getByTask(req, res, next) {
    try {
      const criterias = await taskCriteriaService.findAllByTask(
        req.params.taskId,
      );

      res.status(200).json(criterias);
    } catch (error) {
      next(error);
    }
  }

  static async getSummary(req, res, next) {
    try {
      const summary = await taskCriteriaService.getSummary(req.params.taskId);

      res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const criteria = await taskCriteriaService.findById(req.params.id);

      res.status(200).json(criteria);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const criteria = await taskCriteriaService.update(
        req.params.id,
        req.body,
        req.user,
      );

      res.status(200).json(criteria);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await taskCriteriaService.delete(req.params.id, req.user);

      res.status(200).json({
        message: "Criteria deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TaskCriteriaController;
