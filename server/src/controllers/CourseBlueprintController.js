const { courseBlueprintService } = require("../services");

class CourseBlueprintController {
  static async getAll(req, res, next) { try { res.json(await courseBlueprintService.getAll()); } catch (error) { next(error); } }
  static async getById(req, res, next) { try { res.json(await courseBlueprintService.findById(req.params.id)); } catch (error) { next(error); } }
  static async create(req, res, next) { try { res.status(201).json(await courseBlueprintService.create(req.body, req.user, req.meta)); } catch (error) { next(error); } }
  static async update(req, res, next) { try { res.json(await courseBlueprintService.update(req.params.id, req.body, req.user, req.meta)); } catch (error) { next(error); } }
  static async delete(req, res, next) { try { await courseBlueprintService.delete(req.params.id, req.user, req.meta); res.json({ message: "Course blueprint deleted" }); } catch (error) { next(error); } }
  static async createSession(req, res, next) { try { res.status(201).json(await courseBlueprintService.createSession(req.params.id, req.body, req.user, req.meta)); } catch (error) { next(error); } }
  static async updateSession(req, res, next) { try { res.json(await courseBlueprintService.updateSession(req.params.sessionId, req.body, req.user, req.meta)); } catch (error) { next(error); } }
  static async deleteSession(req, res, next) { try { await courseBlueprintService.deleteSession(req.params.sessionId, req.user, req.meta); res.json({ message: "Blueprint session deleted" }); } catch (error) { next(error); } }
  static async createMaterial(req, res, next) { try { res.status(201).json(await courseBlueprintService.createMaterial(req.params.sessionId, req.body, req.user, req.meta)); } catch (error) { next(error); } }
  static async updateMaterial(req, res, next) { try { res.json(await courseBlueprintService.updateMaterial(req.params.materialId, req.body, req.user, req.meta)); } catch (error) { next(error); } }
  static async deleteMaterial(req, res, next) { try { await courseBlueprintService.deleteMaterial(req.params.materialId, req.user, req.meta); res.json({ message: "Blueprint material deleted" }); } catch (error) { next(error); } }
  static async createTask(req, res, next) { try { res.status(201).json(await courseBlueprintService.createTask(req.params.sessionId, req.body, req.user, req.meta)); } catch (error) { next(error); } }
  static async updateTask(req, res, next) { try { res.json(await courseBlueprintService.updateTask(req.params.taskId, req.body, req.user, req.meta)); } catch (error) { next(error); } }
  static async deleteTask(req, res, next) { try { await courseBlueprintService.deleteTask(req.params.taskId, req.user, req.meta); res.json({ message: "Blueprint task deleted" }); } catch (error) { next(error); } }
}

module.exports = CourseBlueprintController;
