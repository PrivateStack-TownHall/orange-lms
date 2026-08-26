const { menteeService, profileService } = require("../services");

class MenteeController {
  static async getAll(req, res, next) {
    try {
      const mentees = await menteeService.findAll();

      res.status(200).json(mentees);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const mentee = await menteeService.findById(req.params.id);

      res.status(200).json(mentee);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const mentee = await menteeService.create(req.body, req.user, req.meta);

      const profile = await profileService.upsert(mentee.id, {
        age: req.body.age,
        city: req.body.city,
        background: req.body.background,
        phoneNumber: req.body.phoneNumber,
      });

      res.status(201).json({
        message: "Mentee created",
        data: {
          mentee,
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const mentee = await menteeService.update(req.params.id, req.body, req.user, req.meta);

      await profileService.upsert(req.params.id, {
        age: req.body.age,
        city: req.body.city,
        background: req.body.background,
        phoneNumber: req.body.phoneNumber,
      });

      res.status(200).json(mentee);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await menteeService.delete(req.params.id, req.user, req.meta);

      res.status(200).json({
        message: "Mentee deleted",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MenteeController;
