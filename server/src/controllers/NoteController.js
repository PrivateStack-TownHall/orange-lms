const { noteService } = require("../services");

class NoteController {
  static async getByMeeting(req, res, next) {
    try {
      const notes = await noteService.findAllByMeeting(+req.params.meetingId);
      res.json(notes);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req, res, next) {
    try {
      const notes = await noteService.getAll(req.user);
      res.json(notes);
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const payload = {
        ...req.body,
        fileUrl: req.file?.path || req.body.fileUrl,
      };

      const note = await noteService.create(
        req.user,
        req.params.meetingId,
        payload,
      );
      res.status(201).json(note);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const note = await noteService.findById(req.params.id);
      res.json(note);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const payload = {
        ...req.body,
        fileUrl: req.file?.path || req.body.fileUrl,
      };

      const note = await noteService.update(req.params.id, payload, req.user);
      res.json(note);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await noteService.delete(req.params.id, req.user);
      res.json({ message: "Note deleted" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = NoteController;
