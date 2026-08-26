const {
  AssessmentResult,
  TaskSubmission,
  SubmissionCriteriaScore,
  TaskCriteria,
  Task,
  Class,
  User,
} = require("../models");

const { logAudit, logActivity, notifyUsers } = require("../helpers");

class AssessmentResultService {
  static async create(currentUser, data, meta = {}) {
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

    const { isDraft, ...payload } = data;

    const result = await AssessmentResult.create({
      ...payload,
      gradedBy: currentUser.id,
      gradedAt: new Date(),
    });

    await this._syncSubmissionStatus(data.TaskSubmissionId, isDraft, currentUser, meta);

    return result;
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
          include: [{ model: TaskCriteria, as: "criteria" }],
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
          include: [{ model: TaskCriteria, as: "criteria" }],
        },
        {
          model: User,
          as: "grader",
          attributes: ["id", "name", "email"],
        },
      ],
    });
  }

  static async update(id, data, currentUser, meta = {}) {
    if (!["Admin", "Owner", "Mentor"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const result = await AssessmentResult.findByPk(id);

    if (!result) {
      throw new Error("Assessment result not found");
    }

    const { isDraft, ...payload } = data;

    await result.update({ ...payload, gradedBy: currentUser.id, gradedAt: new Date() });

    await this._syncSubmissionStatus(
      result.TaskSubmissionId,
      isDraft,
      currentUser,
      meta,
    );

    return this.findById(id);
  }

  static async delete(id, currentUser, meta = {}) {
    if (!["Admin", "Owner"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const result = await AssessmentResult.findByPk(id);

    if (!result) {
      throw new Error("Assessment result not found");
    }

    await logAudit({
      user: currentUser,
      action: "DELETE",
      resource: "AssessmentResult",
      resourceId: result.id,
      meta,
    });

    await result.destroy();

    return true;
  }

  /**
   * Shared by create() and update(): keeps TaskSubmission.status in sync with
   * the grading action ("Under Review" for a draft save, "Graded" once
   * published), and fires the audit/activity/notification trail.
   */
  static async _syncSubmissionStatus(TaskSubmissionId, isDraft, currentUser, meta) {
    const submission = await TaskSubmission.findByPk(TaskSubmissionId, {
      include: [{ model: Task, include: [Class] }],
    });

    if (!submission) return;

    const nextStatus = isDraft ? "Under Review" : "Graded";

    await submission.update({
      status: nextStatus,
      reviewedAt: new Date(),
    });

    await logAudit({
      user: currentUser,
      action: isDraft ? "UPDATE" : "CREATE",
      resource: "AssessmentResult",
      resourceId: submission.id,
      resourceDetail: `${isDraft ? "Draft saved" : "Published"} for "${submission.Task?.name || ""}"`,
      meta,
    });

    await logActivity({
      user: currentUser,
      activity: "Graded Submission",
      description: `${isDraft ? "Saved draft grade" : "Graded submission"} for "${submission.Task?.name || ""}"`,
      ClassId: submission.Task?.ClassId,
      resourceType: "TaskSubmission",
      resourceId: submission.id,
      meta,
    });

    if (!isDraft) {
      await notifyUsers({
        userIds: submission.UserId,
        type: "Assessment",
        title: "Assessment Result Published",
        message: `Your submission for "${submission.Task?.name || ""}" has been graded.`,
        relatedType: "TaskSubmission",
        relatedId: submission.id,
        ClassId: submission.Task?.ClassId,
      });
    }
  }
}

module.exports = AssessmentResultService;
