const { assessmentResultService } = require("../services");

class AssessmentResultController {
  static async create(req, res, next) {
    try {
      const result = await assessmentResultService.create(req.user, req.body);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const results = await assessmentResultService.findAll();

      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const result = await assessmentResultService.findById(req.params.id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getBySubmission(req, res, next) {
    try {
      const result = await assessmentResultService.findBySubmission(
        req.params.submissionId,
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const result = await assessmentResultService.update(
        req.params.id,
        req.body,
        req.user,
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await assessmentResultService.delete(req.params.id, req.user);

      res.status(200).json({
        message: "Assessment deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AssessmentResultController;
