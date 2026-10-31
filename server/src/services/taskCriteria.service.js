const { TaskCriteria, Task, Class, User } = require("../models");
const ROLES = require("../constants/roles");
const { logAudit } = require("../helpers");

class TaskCriteriaService {
  static getIncludes({ restrictToMentorId, restrictToMenteeId } = {}) {
    const classInclude = {
      model: Class,
      attributes: ["id", "name", "code", "MentorId"],
      ...(restrictToMentorId ? { where: { MentorId: restrictToMentorId } } : {}),
    };

    if (restrictToMenteeId) {
      classInclude.required = true;
      classInclude.include = [
        {
          model: User,
          as: "mentees",
          attributes: [],
          through: {
            attributes: [],
            where: { roleInClass: "Mentee" },
          },
          where: { id: restrictToMenteeId },
        },
      ];
    }

    return [
      {
        model: Task,
        attributes: ["id", "name", "ClassId", "maxScore", "status"],
        include: [classInclude],
        ...(restrictToMentorId ? { required: true } : {}),
      },
      {
        model: User,
        as: "creator",
        attributes: ["id", "name", "email"],
      },
    ];
  }

  static async getAll(currentUser) {
    const options = {
      include: this.getIncludes(),
      order: [["TaskId", "ASC"], ["order", "ASC"], ["id", "ASC"]],
    };

    if (currentUser.role === ROLES.MENTOR) {
      options.include = this.getIncludes({ restrictToMentorId: currentUser.id });
    }

    if (currentUser.role === ROLES.MENTEE) {
      options.include = this.getIncludes({ restrictToMenteeId: currentUser.id });
    }

    return TaskCriteria.findAll(options);
  }

  static async create(currentUser, data, meta = {}) {
    if (!["Admin", "Owner", "Mentor"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const totalPercentage = await TaskCriteria.sum("percentage", {
      where: {
        TaskId: data.TaskId,
      },
    });

    if (Number(totalPercentage || 0) + Number(data.percentage) > 100) {
      throw new Error("Total criteria percentage cannot exceed 100%");
    }

    // Auto-increment `order` when the caller doesn't specify one.
    let order = data.order;

    if (order === undefined || order === null) {
      const count = await TaskCriteria.count({ where: { TaskId: data.TaskId } });
      order = count + 1;
    }

    const criteria = await TaskCriteria.create({
      ...data,
      order,
      createdBy: currentUser.id,
    });

    await logAudit({
      user: currentUser,
      action: "CREATE",
      resource: "TaskCriteria",
      resourceId: criteria.id,
      resourceDetail: criteria.title,
      meta,
    });

    return criteria;
  }

  static async findAllByTask(TaskId) {
    return TaskCriteria.findAll({
      where: {
        TaskId,
      },

      include: this.getIncludes(),

      order: [
        ["order", "ASC"],
        ["id", "ASC"],
      ],
    });
  }

  static async findById(id) {
    return TaskCriteria.findByPk(id, {
      include: this.getIncludes(),
    });
  }

  static async getSummary(TaskId) {
    const criterias = await TaskCriteria.findAll({
      where: {
        TaskId,
      },
    });

    const totalPercentage = criterias.reduce(
      (sum, item) => sum + Number(item.percentage),
      0,
    );

    return {
      totalCriteria: criterias.length,
      totalPercentage,
      totalMaxScore: criterias.reduce((sum, item) => sum + Number(item.maxScore || 0), 0),
      isValid: totalPercentage === 100,
    };
  }

  static async update(id, data, currentUser, meta = {}) {
    if (!["Admin", "Owner", "Mentor"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const criteria = await TaskCriteria.findByPk(id);

    if (!criteria) {
      throw new Error("Task criteria not found");
    }

    const totalPercentage = await TaskCriteria.sum("percentage", {
      where: {
        TaskId: criteria.TaskId,
      },
    });

    const remaining =
      Number(totalPercentage || 0) - Number(criteria.percentage);

    if (
      data.percentage !== undefined &&
      remaining + Number(data.percentage) > 100
    ) {
      throw new Error("Total criteria percentage cannot exceed 100%");
    }

    await criteria.update(data);

    await logAudit({
      user: currentUser,
      action: "UPDATE",
      resource: "TaskCriteria",
      resourceId: criteria.id,
      resourceDetail: criteria.title,
      meta,
    });

    return this.findById(id);
  }

  static async delete(id, currentUser, meta = {}) {
    if (!["Admin", "Owner", "Mentor"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const criteria = await TaskCriteria.findByPk(id);

    if (!criteria) {
      throw new Error("Task criteria not found");
    }

    await logAudit({
      user: currentUser,
      action: "DELETE",
      resource: "TaskCriteria",
      resourceId: criteria.id,
      resourceDetail: criteria.title,
      meta,
    });

    await criteria.destroy();

    return true;
  }
}

module.exports = TaskCriteriaService;
