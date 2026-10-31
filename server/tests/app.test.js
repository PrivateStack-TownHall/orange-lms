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

  it("returns the standard error contract for an unauthenticated route", async () => {
    const response = await request(app).get("/api/users");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "Unauthorized",
      data: null,
    });
  });

  it("protects class history routes with the standard error contract", async () => {
    const response = await request(app).get("/api/history-classes");

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
