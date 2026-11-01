const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");

const routes = require("./routes");
const openapi = require("./docs/openapi");

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

app.get("/api/openapi.json", (req, res) => {
  res.json(openapi);
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi, {
  customSiteTitle: "Orange LMS API Documentation",
}));

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
