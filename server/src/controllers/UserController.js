const { userService, profileService } = require("../services");

class UserController {
  static async getAll(req, res, next) {
    try {
      const users = await userService.findAll(req.query);

      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const user = await userService.findById(req.params.id);

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const user = await userService.create(req.body, req.user, req.meta);

      await profileService.upsert(user.id, {
        age: req.body.age,
        gender: req.body.gender,
        address: req.body.address,
        city: req.body.city,
        country: req.body.country,
        phoneNumber: req.body.phoneNumber,
        background: req.body.background,
      });

      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const updatedUser = await userService.update(
        req.params.id,
        req.body,
        req.user,
        req.meta,
      );
      await profileService.upsert(req.params.id, {
        age: req.body.age,
        gender: req.body.gender,
        address: req.body.address,
        city: req.body.city,
        country: req.body.country,
        phoneNumber: req.body.phoneNumber,
        background: req.body.background,
      });
      res.status(200).json({
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await userService.delete(req.params.id, req.user, req.meta);

      res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
