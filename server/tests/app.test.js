const request = require("supertest");

const app = require("../src/app");

describe("API response contract", () => {
  let consoleErrorSpy;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("returns the standard success contract for the health check", async () => {
    const response = await request(app).get("/api");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Orange LMS Server is running 🚀",
      data: null,
    });
  });

  it("exposes the OpenAPI document", async () => {
    const response = await request(app).get("/api/openapi.json");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      openapi: "3.0.3",
      info: { title: "Orange LMS API", version: "4.0.0" },
    });
    expect(response.body.paths["/calendar/events"].get).toMatchObject({
      security: [{ bearerAuth: [] }],
      tags: ["Learning"],
    });
  });

  it("serves Swagger UI", async () => {
    const response = await request(app).get("/api/docs").redirects(1);

    expect(response.status).toBe(200);
    expect(response.type).toMatch(/html/);
    expect(response.text).toContain("Orange LMS API Documentation");
  });

  it("returns the standard error contract for an unauthenticated route", async () => {
    const response = await request(app).get("/api/users");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "Unauthorized",
      data: null,
    });
  });

  it.each([
    ["/api/assessment-results", "GET"],
    ["/api/attendances", "GET"],
    ["/api/task-criteria", "GET"],
    ["/api/history-classes", "GET"],
    ["/api/history-classes/1/certificate", "POST"],
    ["/api/calendar/events", "GET"],
    ["/api/notifications", "GET"],
    ["/api/reports/dashboard", "GET"],
  ])("protects %s with the standard error contract", async (path, method) => {
    const response = await request(app)[method.toLowerCase()](path);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "Unauthorized",
      data: null,
    });
  });

  it("returns the standard error contract for an unknown route", async () => {
    const response = await request(app).get("/missing-route");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Route not found",
      data: null,
    });
  });
});
