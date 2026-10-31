const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");

const routes = require("./routes");

const {
  ErrorHandling,
  requestMeta,
  responseContract,
} = require("./middlewares");

const app = express();

/**
 * =========================
 * Global Middlewares
 * =========================
 */
app.use(cors());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.set("trust proxy", true);
app.use(requestMeta);
app.use(responseContract);

/**
 * =========================
 * API Routes
 * =========================
 */
app.use("/api", routes);

/**
 * =========================
 * 404 Handler
 * =========================
 */
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: "Route not found",
  });
});

/**
 * =========================
 * Global Error Handler
 * =========================
 */
app.use(ErrorHandling.handle);

module.exports = app;
