const express = require("express");
const router = express.Router();

const { AuthController } = require("../controllers");
const { authentication } = require("../middlewares");

router.get("/", (req, res) =>
  res.json({
    message: "Auth API Works!!!",
  }),
);

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", authentication, AuthController.me);
router.post("/logout", authentication, AuthController.logout);

module.exports = router;
