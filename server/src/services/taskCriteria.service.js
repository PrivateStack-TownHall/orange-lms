const { TaskCriteria, User } = require("../models");

class TaskCriteriaService {
  static async create(currentUser, data) {
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

    return TaskCriteria.create({
      ...data,
      createdBy: currentUser.id,
    });
  }

  static async findAllByTask(TaskId) {
    return TaskCriteria.findAll({
      where: {
        TaskId,
      },

      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
      ],

      order: [["id", "ASC"]],
    });
  }

  static async findById(id) {
    return TaskCriteria.findByPk(id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
      ],
    });
  }

  static async getSummary(TaskId) {
    const criterias = await TaskCriteria.findAll({
      where: {
        TaskId,
      },
    });

    return {
      totalCriteria: criterias.length,

      totalPercentage: criterias.reduce(
        (sum, item) => sum + Number(item.percentage),
        0,
      ),
    };
  }

  static async update(id, data, currentUser) {
    if (!["Admin", "Owner", "Mentor"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const criteria = await TaskCriteria.findByPk(id);

    if (!criteria) {
      throw new Error("Criteria not found");
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

    return this.findById(id);
  }

  static async delete(id, currentUser) {
    if (!["Admin", "Owner", "Mentor"].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const criteria = await TaskCriteria.findByPk(id);

    if (!criteria) {
      throw new Error("Criteria not found");
    }

    await criteria.destroy();

    return true;
  }
}

module.exports = TaskCriteriaService;
