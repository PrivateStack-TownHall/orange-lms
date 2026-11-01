const {
  CourseBlueprint,
  BlueprintMeeting,
  BlueprintMaterial,
  BlueprintTask,
  User,
} = require("../models");
const ROLES = require("../constants/roles");
const { logAudit } = require("../helpers");

const SESSION_INCLUDE = {
  model: BlueprintMeeting,
  as: "meetings",
  include: [
    { model: BlueprintMaterial, as: "materials" },
    { model: BlueprintTask, as: "tasks" },
  ],
};

class CourseBlueprintService {
  static getIncludes() {
    return [
      { model: User, as: "creator", attributes: ["id", "name", "email"] },
      { model: User, as: "updater", attributes: ["id", "name", "email"] },
      SESSION_INCLUDE,
    ];
  }

  static assertCanManage(currentUser) {
    if (![ROLES.OWNER, ROLES.ADMIN].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }
  }

  static async getAll() {
    return CourseBlueprint.findAll({
      include: this.getIncludes(),
      order: [["name", "ASC"], [{ model: BlueprintMeeting, as: "meetings" }, "sequence", "ASC"]],
    });
  }

  static async findById(id) {
    const blueprint = await CourseBlueprint.findByPk(id, {
      include: this.getIncludes(),
      order: [[{ model: BlueprintMeeting, as: "meetings" }, "sequence", "ASC"]],
    });

    if (!blueprint) throw new Error("Course blueprint not found");
    return blueprint;
  }

  static async create(data, currentUser, meta = {}) {
    this.assertCanManage(currentUser);
    const blueprint = await CourseBlueprint.create({ ...data, createdBy: currentUser.id, updatedBy: currentUser.id });
    await logAudit({ user: currentUser, action: "CREATE", resource: "CourseBlueprint", resourceId: blueprint.id, resourceDetail: blueprint.name, meta });
    return blueprint;
  }

  static async update(id, data, currentUser, meta = {}) {
    this.assertCanManage(currentUser);
    const blueprint = await CourseBlueprint.findByPk(id);
    if (!blueprint) throw new Error("Course blueprint not found");
    await blueprint.update({ ...data, updatedBy: currentUser.id });
    await logAudit({ user: currentUser, action: "UPDATE", resource: "CourseBlueprint", resourceId: blueprint.id, resourceDetail: blueprint.name, meta });
    return this.findById(id);
  }

  static async delete(id, currentUser, meta = {}) {
    this.assertCanManage(currentUser);
    const blueprint = await CourseBlueprint.findByPk(id);
    if (!blueprint) throw new Error("Course blueprint not found");
    await logAudit({ user: currentUser, action: "DELETE", resource: "CourseBlueprint", resourceId: blueprint.id, resourceDetail: blueprint.name, meta });
    await blueprint.destroy();
    return true;
  }

  static async createMeeting(blueprintId, data, currentUser, meta = {}) {
    this.assertCanManage(currentUser);
    await this.findById(blueprintId);
    const sequence = data.sequence || ((await BlueprintMeeting.max("sequence", { where: { CourseBlueprintId: blueprintId } })) || 0) + 1;
    const meeting = await BlueprintMeeting.create({ ...data, CourseBlueprintId: blueprintId, sequence });
    await this.syncTotalMeetings(blueprintId, currentUser.id);
    await logAudit({ user: currentUser, action: "CREATE", resource: "BlueprintMeeting", resourceId: meeting.id, resourceDetail: meeting.title, meta });
    return meeting;
  }

  static async updateMeeting(meetingId, data, currentUser, meta = {}) {
    this.assertCanManage(currentUser);
    const meeting = await BlueprintMeeting.findByPk(meetingId);
    if (!meeting) throw new Error("Blueprint meeting not found");
    await meeting.update(data);
    await this.syncTotalMeetings(meeting.CourseBlueprintId, currentUser.id);
    await logAudit({ user: currentUser, action: "UPDATE", resource: "BlueprintMeeting", resourceId: meeting.id, resourceDetail: meeting.title, meta });
    return meeting;
  }

  static async deleteMeeting(meetingId, currentUser, meta = {}) {
    this.assertCanManage(currentUser);
    const meeting = await BlueprintMeeting.findByPk(meetingId);
    if (!meeting) throw new Error("Blueprint meeting not found");
    const { CourseBlueprintId, id, title } = meeting;
    await meeting.destroy();
    await this.syncTotalMeetings(CourseBlueprintId, currentUser.id);
    await logAudit({ user: currentUser, action: "DELETE", resource: "BlueprintMeeting", resourceId: id, resourceDetail: title, meta });
    return true;
  }

  static async createMaterial(meetingId, data, currentUser, meta = {}) {
    this.assertCanManage(currentUser);
    await this.getMeeting(meetingId);
    const sortOrder = data.sortOrder || ((await BlueprintMaterial.max("sortOrder", { where: { BlueprintMeetingId: meetingId } })) || 0) + 1;
    const material = await BlueprintMaterial.create({ ...data, BlueprintMeetingId: meetingId, sortOrder });
    await logAudit({ user: currentUser, action: "CREATE", resource: "BlueprintMaterial", resourceId: material.id, resourceDetail: material.name, meta });
    return material;
  }

  static async updateMaterial(id, data, currentUser, meta = {}) {
    this.assertCanManage(currentUser);
    const material = await BlueprintMaterial.findByPk(id);
    if (!material) throw new Error("Blueprint material not found");
    await material.update(data);
    await logAudit({ user: currentUser, action: "UPDATE", resource: "BlueprintMaterial", resourceId: material.id, resourceDetail: material.name, meta });
    return material;
  }

  static async deleteMaterial(id, currentUser, meta = {}) {
    this.assertCanManage(currentUser);
    const material = await BlueprintMaterial.findByPk(id);
    if (!material) throw new Error("Blueprint material not found");
    await material.destroy();
    await logAudit({ user: currentUser, action: "DELETE", resource: "BlueprintMaterial", resourceId: id, resourceDetail: material.name, meta });
    return true;
  }

  static async createTask(meetingId, data, currentUser, meta = {}) {
    this.assertCanManage(currentUser);
    await this.getMeeting(meetingId);
    const sortOrder = data.sortOrder || ((await BlueprintTask.max("sortOrder", { where: { BlueprintMeetingId: meetingId } })) || 0) + 1;
    const task = await BlueprintTask.create({ ...data, BlueprintMeetingId: meetingId, sortOrder });
    await logAudit({ user: currentUser, action: "CREATE", resource: "BlueprintTask", resourceId: task.id, resourceDetail: task.name, meta });
    return task;
  }

  static async updateTask(id, data, currentUser, meta = {}) {
    this.assertCanManage(currentUser);
    const task = await BlueprintTask.findByPk(id);
    if (!task) throw new Error("Blueprint task not found");
    await task.update(data);
    await logAudit({ user: currentUser, action: "UPDATE", resource: "BlueprintTask", resourceId: task.id, resourceDetail: task.name, meta });
    return task;
  }

  static async deleteTask(id, currentUser, meta = {}) {
    this.assertCanManage(currentUser);
    const task = await BlueprintTask.findByPk(id);
    if (!task) throw new Error("Blueprint task not found");
    await task.destroy();
    await logAudit({ user: currentUser, action: "DELETE", resource: "BlueprintTask", resourceId: id, resourceDetail: task.name, meta });
    return true;
  }

  static async getMeeting(id) {
    const meeting = await BlueprintMeeting.findByPk(id);
    if (!meeting) throw new Error("Blueprint meeting not found");
    return meeting;
  }

  static async syncTotalMeetings(blueprintId, updatedBy) {
    const totalMeetings = await BlueprintMeeting.count({ where: { CourseBlueprintId: blueprintId } });
    await CourseBlueprint.update({ totalMeetings, updatedBy }, { where: { id: blueprintId } });
  }
}

module.exports = CourseBlueprintService;
