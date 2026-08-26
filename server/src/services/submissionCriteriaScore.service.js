const {
  SubmissionCriteriaScore,
  TaskCriteria,
  AssessmentResult,
} = require("../models");
const { logAudit } = require("../helpers");

class SubmissionCriteriaScoreService {
  static async create(currentUser, data, meta = {}) {
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

    const score = await SubmissionCriteriaScore.create(data);

    await logAudit({
      user: currentUser,
      action: "CREATE",
      resource: "SubmissionCriteriaScore",
      resourceId: score.id,
      resourceDetail: criteria.title,
      meta,
    });

    return score;
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

  static async update(id, data, currentUser, meta = {}) {
    if (!["Admin", "Owner", "Mentor"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const score = await SubmissionCriteriaScore.findByPk(id);

    if (!score) {
      throw new Error("Score not found");
    }

    await score.update(data);

    await logAudit({
      user: currentUser,
      action: "UPDATE",
      resource: "SubmissionCriteriaScore",
      resourceId: score.id,
      meta,
    });

    return this.findById(id);
  }

  static async delete(id, currentUser, meta = {}) {
    if (!["Admin", "Owner"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const score = await SubmissionCriteriaScore.findByPk(id);

    if (!score) {
      throw new Error("Score not found");
    }

    await logAudit({
      user: currentUser,
      action: "DELETE",
      resource: "SubmissionCriteriaScore",
      resourceId: score.id,
      meta,
    });

    await score.destroy();

    return true;
  }
}

module.exports = SubmissionCriteriaScoreService;
