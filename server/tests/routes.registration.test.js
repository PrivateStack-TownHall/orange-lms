const mockHandler = (req, res) => res.status(200).json({ matched: true });
const mockController = new Proxy({}, { get: () => mockHandler });
const mockControllers = new Proxy({}, { get: () => mockController });

jest.mock("../src/controllers", () => mockControllers);
jest.mock("../src/middlewares", () => ({
  authentication: (req, res, next) => {
    req.user = { id: 1, role: "Owner" };
    next();
  },
  authorization: () => (req, res, next) => next(),
  upload: { single: () => (req, res, next) => next() },
  requestMeta: (req, res, next) => next(),
  responseContract: (req, res, next) => next(),
  ErrorHandling: { handle: (error, req, res) => res.status(500).json({ error: error.message }) },
}));

const request = require("supertest");
const openapi = require("../src/docs/openapi");
const app = require("../src/app");

const protectedOperations = Object.entries(openapi.paths)
  .flatMap(([path, pathItem]) => Object.entries(pathItem)
    .filter(([, operation]) => operation.security?.length)
    .map(([method]) => [method, `/api${path.replace(/\{[^}]+\}/g, "1")}`]));

describe("OpenAPI protected route registration", () => {
  it.each(protectedOperations)("%s %s resolves to a registered Express handler", async (method, path) => {
    const response = await request(app)[method](path);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ matched: true });
  });
});
