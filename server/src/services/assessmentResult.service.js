const {
  AssessmentResult,
  TaskSubmission,
  SubmissionCriteriaScore,
  User,
} = require("../models");

class AssessmentResultService {
  static async create(currentUser, data) {
    if (!["Admin", "Owner", "Mentor"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const existing = await AssessmentResult.findOne({
      where: {
        TaskSubmissionId: data.TaskSubmissionId,
      },
    });

    if (existing) {
      throw new Error("Assessment result already exists for this submission");
    }

    return AssessmentResult.create({
      ...data,
      gradedBy: currentUser.id,
      gradedAt: new Date(),
    });
  }

  static async findAll() {
    return AssessmentResult.findAll({
      include: [
        {
          model: TaskSubmission,
        },
        {
          model: User,
          as: "grader",
          attributes: ["id", "name", "email"],
        },
      ],

      order: [["id", "DESC"]],
    });
  }

  static async findBySubmission(TaskSubmissionId) {
    return AssessmentResult.findOne({
      where: {
        TaskSubmissionId,
      },

      include: [
        {
          model: SubmissionCriteriaScore,
          as: "scores",
        },
        {
          model: User,
          as: "grader",
          attributes: ["id", "name", "email"],
        },
      ],
    });
  }

  static async findById(id) {
    return AssessmentResult.findByPk(id, {
      include: [
        {
          model: SubmissionCriteriaScore,
          as: "scores",
        },
        {
          model: User,
          as: "grader",
          attributes: ["id", "name", "email"],
        },
      ],
    });
  }

  static async update(id, data, currentUser) {
    if (!["Admin", "Owner", "Mentor"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const result = await AssessmentResult.findByPk(id);

    if (!result) {
      throw new Error("Assessment result not found");
    }

    await result.update(data);

    return this.findById(id);
  }

  static async delete(id, currentUser) {
    if (!["Admin", "Owner"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const result = await AssessmentResult.findByPk(id);

    if (!result) {
      throw new Error("Assessment result not found");
    }

    await result.destroy();

    return true;
  }
}

module.exports = AssessmentResultService;
