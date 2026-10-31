const {
  AssessmentResult,
  TaskSubmission,
  SubmissionCriteriaScore,
  TaskCriteria,
  Task,
  Class,
  Meeting,
  User,
} = require("../models");

const ROLES = require("../constants/roles");

const { logAudit, logActivity, notifyUsers } = require("../helpers");

class AssessmentResultService {
  static getIncludes({ restrictToMentorId } = {}) {
    return [
      {
        model: TaskSubmission,
        include: [
          {
            model: Task,
            attributes: ["id", "name", "ClassId", "MeetingId", "maxScore"],
            include: [
              {
                model: Meeting,
                attributes: ["id", "name", "meetingNumber", "meetingDate"],
              },
              {
                model: Class,
                attributes: ["id", "name", "code", "MentorId"],
                ...(restrictToMentorId
                  ? { where: { MentorId: restrictToMentorId } }
                  : {}),
              },
            ],
            ...(restrictToMentorId ? { required: true } : {}),
          },
          {
            model: User,
            attributes: ["id", "name", "email"],
          },
        ],
        ...(restrictToMentorId ? { required: true } : {}),
      },
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
    ];
  }

  static async create(currentUser, data, meta = {}) {
    if (!["Admin", "Owner", "Mentor"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    await this.assertCanManageSubmission(data.TaskSubmissionId, currentUser);

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

  static async findAll(currentUser) {
    const submissionWhere = {};
    const restrictToMentorId =
      currentUser.role === ROLES.MENTOR ? currentUser.id : undefined;

    if (currentUser.role === ROLES.MENTEE) {
      submissionWhere.UserId = currentUser.id;
    }

    return AssessmentResult.findAll({
      include: this.getIncludes({ restrictToMentorId }).map((include) =>
        include.model === TaskSubmission
          ? { ...include, ...(Object.keys(submissionWhere).length ? { where: submissionWhere } : {}) }
          : include,
      ),

      order: [["id", "DESC"]],
    });
  }

  static async findBySubmission(TaskSubmissionId, currentUser) {
    return this.findOne({ TaskSubmissionId }, currentUser);
  }

  static async findById(id, currentUser) {
    return this.findOne({ id }, currentUser);
  }

  static async findOne(where, currentUser) {
    const submissionWhere = {};
    const restrictToMentorId =
      currentUser.role === ROLES.MENTOR ? currentUser.id : undefined;

    if (currentUser.role === ROLES.MENTEE) {
      submissionWhere.UserId = currentUser.id;
    }

    const result = await AssessmentResult.findOne({
      where,
      include: this.getIncludes({ restrictToMentorId }).map((include) =>
        include.model === TaskSubmission
          ? { ...include, ...(Object.keys(submissionWhere).length ? { where: submissionWhere } : {}) }
          : include,
      ),
    });

    if (!result) {
      throw new Error("Assessment result not found");
    }

    return result;
  }

  static async update(id, data, currentUser, meta = {}) {
    if (!["Admin", "Owner", "Mentor"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const result = await this.findById(id, currentUser);

    const { isDraft, ...payload } = data;

    await result.update({ ...payload, gradedBy: currentUser.id, gradedAt: new Date() });

    await this._syncSubmissionStatus(
      result.TaskSubmissionId,
      isDraft,
      currentUser,
      meta,
    );

    return this.findById(id, currentUser);
  }

  static async assertCanManageSubmission(TaskSubmissionId, currentUser) {
    const submission = await TaskSubmission.findByPk(TaskSubmissionId, {
      include: [{ model: Task, include: [Class] }],
    });

    if (!submission) {
      throw new Error("Submission not found");
    }

    if (
      currentUser.role === ROLES.MENTOR &&
      submission.Task?.Class?.MentorId !== currentUser.id
    ) {
      throw new Error("Permission denied");
    }

    return submission;
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
