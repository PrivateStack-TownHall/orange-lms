const {
  SubmissionCriteriaScore,
  TaskCriteria,
  AssessmentResult,
  TaskSubmission,
  Task,
  Class,
  ClassUser,
} = require("../models");
const ROLES = require("../constants/roles");
const { logAudit } = require("../helpers");

class SubmissionCriteriaScoreService {
  static async create(currentUser, data, meta = {}) {
    if (![ROLES.ADMIN, ROLES.OWNER, ROLES.MENTOR, ROLES.REVIEWER].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const assessment = await AssessmentResult.findByPk(data.AssessmentResultId);

    if (!assessment) {
      throw new Error("Assessment result not found");
    }

    await this.assertCanManageAssessment(assessment.id, currentUser);

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

  static async findAllByAssessment(AssessmentResultId, currentUser) {
    await this.assertCanReadAssessment(AssessmentResultId, currentUser);

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

  static async findById(id, currentUser) {
    const score = await SubmissionCriteriaScore.findByPk(id, {
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

    if (!score) return null;

    await this.assertCanReadAssessment(score.AssessmentResultId, currentUser);
    return score;
  }

  static async update(id, data, currentUser, meta = {}) {
    if (![ROLES.ADMIN, ROLES.OWNER, ROLES.MENTOR, ROLES.REVIEWER].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const score = await SubmissionCriteriaScore.findByPk(id);

    if (!score) {
      throw new Error("Score not found");
    }

    await this.assertCanManageAssessment(score.AssessmentResultId, currentUser);

    await score.update(data);

    await logAudit({
      user: currentUser,
      action: "UPDATE",
      resource: "SubmissionCriteriaScore",
      resourceId: score.id,
      meta,
    });

    return this.findById(id, currentUser);
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

  static async assertCanReadAssessment(AssessmentResultId, currentUser) {
    const assessment = await AssessmentResult.findByPk(AssessmentResultId, {
      include: [{
        model: TaskSubmission,
        include: [{ model: Task, include: [Class] }],
      }],
    });

    if (!assessment) {
      throw new Error("Assessment result not found");
    }

    const isOwnerOrAdmin = [ROLES.OWNER, ROLES.ADMIN].includes(currentUser.role);
    const isAssignedMentor =
      currentUser.role === ROLES.MENTOR &&
      assessment.TaskSubmission?.Task?.Class?.MentorId === currentUser.id;
    const isOwningMentee =
      currentUser.role === ROLES.MENTEE &&
      assessment.TaskSubmission?.UserId === currentUser.id;

    if (isOwnerOrAdmin || isAssignedMentor || isOwningMentee) return assessment;

    if (currentUser.role === ROLES.REVIEWER) {
      const assignment = await ClassUser.findOne({
        where: {
          ClassId: assessment.TaskSubmission?.Task?.ClassId,
          UserId: currentUser.id,
          roleInClass: "Reviewer",
        },
      });

      if (assignment) return assessment;
    }

    throw new Error("Permission denied");
  }

  static async assertCanManageAssessment(AssessmentResultId, currentUser) {
    if (![ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR, ROLES.REVIEWER].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    return this.assertCanReadAssessment(AssessmentResultId, currentUser);
  }
}

module.exports = SubmissionCriteriaScoreService;
