const {
  TaskSubmission,
  Task,
  Class,
  User,
  AssessmentResult,
  SubmissionCriteriaScore,
  TaskCriteria,
} = require("../models");

const ROLES = require("../constants/roles");
const { logAudit, logActivity, notifyUsers } = require("../helpers");

// Deep include reused by every "single submission" read so Mentor / Mentee /
// Admin submission-detail pages all get the same fully-populated shape:
// AssessmentResult -> scores -> criteria, plus the grader.
const DETAIL_INCLUDE = [
  {
    model: Task,
    include: [Class],
  },
  User,
  {
    model: AssessmentResult,
    include: [
      {
        model: SubmissionCriteriaScore,
        as: "scores",
        include: [{ model: TaskCriteria, as: "criteria" }],
      },
      { model: User, as: "grader", attributes: ["id", "name", "email", "role"] },
    ],
  },
];

class TaskSubmissionService {
  static async create(currentUser, data, meta = {}) {
    if (currentUser.role !== ROLES.MENTEE) {
      throw new Error("Only mentee can submit task");
    }

    const submission = await TaskSubmission.create({
      ...data,
      status: "Submitted",
    });

    const task = await Task.findByPk(data.TaskId, { include: [Class] });

    await logAudit({
      user: currentUser,
      action: "CREATE",
      resource: "TaskSubmission",
      resourceId: submission.id,
      resourceDetail: task?.name,
      meta,
    });

    await logActivity({
      user: currentUser,
      activity: "Submitted Task",
      description: `Submitted task "${task?.name || ""}"`,
      ClassId: task?.ClassId,
      resourceType: "Task",
      resourceId: data.TaskId,
      meta,
    });

    if (task?.Class?.MentorId) {
      await notifyUsers({
        userIds: task.Class.MentorId,
        type: "Task",
        title: "New Submission",
        message: `${currentUser.name || "A mentee"} submitted "${task.name}".`,
        relatedType: "TaskSubmission",
        relatedId: submission.id,
        ClassId: task.ClassId,
      });
    }

    return submission;
  }

  static async findAll(currentUser) {
    /**
     * Owner & Admin
     */
    if ([ROLES.OWNER, ROLES.ADMIN].includes(currentUser.role)) {
      return TaskSubmission.findAll({
        include: DETAIL_INCLUDE,
      });
    }

    /**
     * Mentor
     */
    if (currentUser.role === ROLES.MENTOR) {
      return TaskSubmission.findAll({
        include: [
          {
            model: Task,
            include: [
              {
                model: Class,
                where: {
                  MentorId: currentUser.id,
                },
              },
            ],
          },
          User,
          {
            model: AssessmentResult,
            include: [
              {
                model: SubmissionCriteriaScore,
                as: "scores",
                include: [{ model: TaskCriteria, as: "criteria" }],
              },
              { model: User, as: "grader", attributes: ["id", "name", "email"] },
            ],
          },
        ],
      });
    }

    /**
     * Mentee
     */
    if (currentUser.role === ROLES.MENTEE) {
      return TaskSubmission.findAll({
        where: {
          UserId: currentUser.id,
        },
        include: DETAIL_INCLUDE,
      });
    }

    throw new Error("Unauthorized");
  }

  static async findAllByTask(TaskId, currentUser) {
    /**
     * Owner & Admin
     */
    if ([ROLES.OWNER, ROLES.ADMIN].includes(currentUser.role)) {
      return TaskSubmission.findAll({
        where: { TaskId },
        include: DETAIL_INCLUDE,
      });
    }

    /**
     * Mentor
     */
    if (currentUser.role === ROLES.MENTOR) {
      return TaskSubmission.findAll({
        where: { TaskId },
        include: [
          {
            model: Task,
            include: [
              {
                model: Class,
                where: {
                  MentorId: currentUser.id,
                },
              },
            ],
          },
          User,
          {
            model: AssessmentResult,
            include: [
              {
                model: SubmissionCriteriaScore,
                as: "scores",
                include: [{ model: TaskCriteria, as: "criteria" }],
              },
              { model: User, as: "grader", attributes: ["id", "name", "email"] },
            ],
          },
        ],
      });
    }

    /**
     * Mentee
     */
    if (currentUser.role === ROLES.MENTEE) {
      return TaskSubmission.findAll({
        where: {
          TaskId,
          UserId: currentUser.id,
        },
        include: DETAIL_INCLUDE,
      });
    }

    throw new Error("Unauthorized");
  }

  /**
   * Role-aware single submission fetch, used by the Submission Detail page
   * for Mentor / Mentee / Admin alike. The response shape is identical for
   * every role (FE decides read-only vs editable UI); the only behavioral
   * difference is that an Admin/Owner view is recorded as a "viewed" event
   * so it shows up in the Submission Timeline ("Viewed by Admin").
   */
  static async findById(id, currentUser, meta = {}) {
    const submission = await TaskSubmission.findByPk(id, {
      include: DETAIL_INCLUDE,
    });

    if (!submission) {
      throw new Error("Submission not found");
    }

    const isOwnerOrAdmin = [ROLES.OWNER, ROLES.ADMIN].includes(currentUser.role);
    const isAssignedMentor =
      currentUser.role === ROLES.MENTOR &&
      submission.Task?.Class?.MentorId === currentUser.id;
    const isOwningMentee =
      currentUser.role === ROLES.MENTEE && submission.UserId === currentUser.id;

    if (!isOwnerOrAdmin && !isAssignedMentor && !isOwningMentee) {
      throw new Error("Permission denied");
    }

    if (isOwnerOrAdmin) {
      await logActivity({
        user: currentUser,
        activity: "Viewed Submission",
        description: `Viewed submission for "${submission.Task?.name || ""}" (Admin view)`,
        ClassId: submission.Task?.ClassId,
        resourceType: "TaskSubmission",
        resourceId: submission.id,
        meta,
      });
    }

    return submission;
  }

  static async update(id, data, currentUser, meta = {}) {
    const submission = await TaskSubmission.findByPk(id, {
      include: [
        {
          model: Task,
          include: [Class],
        },
      ],
    });

    if (!submission) {
      throw new Error("Submission not found");
    }

    const isOwnerOrAdmin = [ROLES.OWNER, ROLES.ADMIN].includes(currentUser.role);
    const isAssignedMentor =
      currentUser.role === ROLES.MENTOR &&
      submission.Task?.Class?.MentorId === currentUser.id;
    const isOwningMentee =
      currentUser.role === ROLES.MENTEE && submission.UserId === currentUser.id;

    if (!isOwnerOrAdmin && !isAssignedMentor && !isOwningMentee) {
      throw new Error("Permission denied");
    }

    await submission.update(data);

    await logAudit({
      user: currentUser,
      action: "UPDATE",
      resource: "TaskSubmission",
      resourceId: submission.id,
      resourceDetail: submission.Task?.name,
      meta,
    });

    if (isOwningMentee) {
      await logActivity({
        user: currentUser,
        activity: "Updated Submission",
        description: `Resubmitted task "${submission.Task?.name || ""}"`,
        ClassId: submission.Task?.ClassId,
        resourceType: "Task",
        resourceId: submission.TaskId,
        meta,
      });
    }

    return submission;
  }

  static async delete(id, currentUser, meta = {}) {
    const submission = await TaskSubmission.findByPk(id, {
      include: [
        {
          model: Task,
          include: [Class],
        },
      ],
    });

    if (!submission) {
      throw new Error("Submission not found");
    }

    if ([ROLES.OWNER, ROLES.ADMIN].includes(currentUser.role)) {
      await logAudit({
        user: currentUser,
        action: "DELETE",
        resource: "TaskSubmission",
        resourceId: submission.id,
        resourceDetail: submission.Task?.name,
        meta,
      });

      return submission.destroy();
    }

    if (
      currentUser.role === ROLES.MENTEE &&
      submission.UserId === currentUser.id
    ) {
      await logAudit({
        user: currentUser,
        action: "DELETE",
        resource: "TaskSubmission",
        resourceId: submission.id,
        resourceDetail: submission.Task?.name,
        meta,
      });

      return submission.destroy();
    }

    throw new Error("Permission denied");
  }
}

module.exports = TaskSubmissionService;
