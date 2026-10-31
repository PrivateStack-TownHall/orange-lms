const express = require("express");
const { CalendarController } = require("../controllers");
const { authorization } = require("../middlewares");

const router = express.Router();

router.get("/events", authorization("calendar", "read"), CalendarController.getEvents);

module.exports = router;
