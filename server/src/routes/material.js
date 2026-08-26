const express = require("express");
const router = express.Router({ mergeParams: true });

const { MaterialController } = require("../controllers");
const { authorization, upload } = require("../middlewares");

router.get(
  "/",
  authorization("material", "read"),
  MaterialController.getByMeeting,
);

router.post(
  "/",
  authorization("material", "create"),
  upload.single("file"),
  MaterialController.create,
);

router.get(
  "/all",
  authorization("material", "read"),
  MaterialController.getAll,
);

router.get(
  "/:id",
  authorization("material", "read"),
  MaterialController.getById,
);

router.put(
  "/:id",
  authorization("material", "update"),
  upload.single("file"),
  MaterialController.update,
);

router.delete(
  "/:id",
  authorization("material", "delete"),
  MaterialController.delete,
);

module.exports = router;
