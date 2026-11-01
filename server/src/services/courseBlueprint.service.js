const {
  CourseBlueprint,
  BlueprintSession,
  BlueprintMaterial,
  BlueprintTask,
  User,
} = require("../models");
const ROLES = require("../constants/roles");
const { logAudit } = require("../helpers");

const SESSION_INCLUDE = {
  model: BlueprintSession,
  as: "sessions",
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
      order: [["name", "ASC"], [{ model: BlueprintSession, as: "sessions" }, "sequence", "ASC"]],
    });
  }

  static async findById(id) {
    const blueprint = await CourseBlueprint.findByPk(id, {
      include: this.getIncludes(),
      order: [[{ model: BlueprintSession, as: "sessions" }, "sequence", "ASC"]],
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

  static async createSession(blueprintId, data, currentUser, meta = {}) {
    this.assertCanManage(currentUser);
    await this.findById(blueprintId);
    const sequence = data.sequence || ((await BlueprintSession.max("sequence", { where: { CourseBlueprintId: blueprintId } })) || 0) + 1;
    const session = await BlueprintSession.create({ ...data, CourseBlueprintId: blueprintId, sequence });
    await this.syncTotalSessions(blueprintId, currentUser.id);
    await logAudit({ user: currentUser, action: "CREATE", resource: "BlueprintSession", resourceId: session.id, resourceDetail: session.title, meta });
    return session;
  }

  static async updateSession(sessionId, data, currentUser, meta = {}) {
    this.assertCanManage(currentUser);
    const session = await BlueprintSession.findByPk(sessionId);
    if (!session) throw new Error("Blueprint session not found");
    await session.update(data);
    await this.syncTotalSessions(session.CourseBlueprintId, currentUser.id);
    await logAudit({ user: currentUser, action: "UPDATE", resource: "BlueprintSession", resourceId: session.id, resourceDetail: session.title, meta });
    return session;
  }

  static async deleteSession(sessionId, currentUser, meta = {}) {
    this.assertCanManage(currentUser);
    const session = await BlueprintSession.findByPk(sessionId);
    if (!session) throw new Error("Blueprint session not found");
    const { CourseBlueprintId, id, title } = session;
    await session.destroy();
    await this.syncTotalSessions(CourseBlueprintId, currentUser.id);
    await logAudit({ user: currentUser, action: "DELETE", resource: "BlueprintSession", resourceId: id, resourceDetail: title, meta });
    return true;
  }

  static async createMaterial(sessionId, data, currentUser, meta = {}) {
    this.assertCanManage(currentUser);
    await this.getSession(sessionId);
    const sortOrder = data.sortOrder || ((await BlueprintMaterial.max("sortOrder", { where: { BlueprintSessionId: sessionId } })) || 0) + 1;
    const material = await BlueprintMaterial.create({ ...data, BlueprintSessionId: sessionId, sortOrder });
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

  static async createTask(sessionId, data, currentUser, meta = {}) {
    this.assertCanManage(currentUser);
    await this.getSession(sessionId);
    const sortOrder = data.sortOrder || ((await BlueprintTask.max("sortOrder", { where: { BlueprintSessionId: sessionId } })) || 0) + 1;
    const task = await BlueprintTask.create({ ...data, BlueprintSessionId: sessionId, sortOrder });
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

  static async getSession(id) {
    const session = await BlueprintSession.findByPk(id);
    if (!session) throw new Error("Blueprint session not found");
    return session;
  }

  static async syncTotalSessions(blueprintId, updatedBy) {
    const totalSessions = await BlueprintSession.count({ where: { CourseBlueprintId: blueprintId } });
    await CourseBlueprint.update({ totalSessions, updatedBy }, { where: { id: blueprintId } });
  }
}

module.exports = CourseBlueprintService;
