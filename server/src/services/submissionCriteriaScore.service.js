const {
  SubmissionCriteriaScore,
  TaskCriteria,
  AssessmentResult,
} = require("../models");

class SubmissionCriteriaScoreService {
  static async create(currentUser, data) {
    if (!["Admin", "Owner", "Mentor"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const assessment = await AssessmentResult.findByPk(data.AssessmentResultId);

    if (!assessment) {
      throw new Error("Assessment result not found");
    }

    const criteria = await TaskCriteria.findByPk(data.TaskCriteriaId);

    if (!criteria) {
      throw new Error("Task criteria not found");
    }

    return SubmissionCriteriaScore.create(data);
  }

  static async findAllByAssessment(AssessmentResultId) {
    return SubmissionCriteriaScore.findAll({
      where: {
        AssessmentResultId,
      },

      include: [
        {
          model: TaskCriteria,
          as: "criteria",
        },
      ],

      order: [["id", "ASC"]],
    });
  }

  static async findById(id) {
    return SubmissionCriteriaScore.findByPk(id, {
      include: [
        {
          model: TaskCriteria,
          as: "criteria",
        },
        {
          model: AssessmentResult,
          as: "assessment",
        },
      ],
    });
  }

  static async update(id, data, currentUser) {
    if (!["Admin", "Owner", "Mentor"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const score = await SubmissionCriteriaScore.findByPk(id);

    if (!score) {
      throw new Error("Score not found");
    }

    await score.update(data);

    return this.findById(id);
  }

  static async delete(id, currentUser) {
    if (!["Admin", "Owner"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const score = await SubmissionCriteriaScore.findByPk(id);

    if (!score) {
      throw new Error("Score not found");
    }

    await score.destroy();

    return true;
  }
}

module.exports = SubmissionCriteriaScoreService;
