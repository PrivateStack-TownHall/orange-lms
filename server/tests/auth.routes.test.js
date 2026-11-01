const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  me: jest.fn(),
};

const mockJwt = {
  verifyToken: jest.fn(),
};

jest.mock("../src/services", () => ({ authService: mockAuthService }));
jest.mock("../src/helpers", () => ({ jwt: mockJwt }));

const request = require("supertest");
const app = require("../src/app");

describe("Auth routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockJwt.verifyToken.mockReturnValue({ id: 7, role: "Mentee" });
  });

  it("registers through the standard response contract", async () => {
    mockAuthService.register.mockResolvedValue({ id: 7, name: "Jane Doe" });

    const response = await request(app)
      .post("/api/auth/register")
      .send({ name: "Jane Doe", email: "jane@example.com", password: "Secret123" });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      message: "Register success",
      data: { id: 7, name: "Jane Doe" },
    });
    expect(mockAuthService.register).toHaveBeenCalledWith(
      expect.objectContaining({ email: "jane@example.com" }),
      expect.any(Object),
    );
  });

  it("logs in and returns an access token", async () => {
    mockAuthService.login.mockResolvedValue({ access_token: "signed-token" });

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "jane@example.com", password: "Secret123" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Login success",
      data: { access_token: "signed-token" },
    });
  });

  it("returns the current user with a valid bearer token", async () => {
    mockAuthService.me.mockResolvedValue({ id: 7, name: "Jane Doe" });

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer signed-token");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({ id: 7, name: "Jane Doe" });
    expect(mockAuthService.me).toHaveBeenCalledWith({ id: 7, role: "Mentee" });
  });

  it("logs out with a valid bearer token", async () => {
    mockAuthService.logout.mockResolvedValue(true);

    const response = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", "Bearer signed-token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Logout success",
      data: null,
    });
  });
});
