const { authService } = require("../services");

class AuthController {
  static async register(req, res, next) {
    try {
      const result = await authService.register(req.body, req.meta);

      res.status(201).json({
        message: "Register success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const result = await authService.login(req.body, req.meta);

      res.status(200).json({
        message: "Login success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      await authService.logout(req.user, req.meta);

      res.status(200).json({
        message: "Logout success",
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req, res, next) {
    try {
      const user = await authService.me(req.user);

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
