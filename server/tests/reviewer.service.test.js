const mockModels = {
  ClassUser: { findOne: jest.fn(), create: jest.fn(), destroy: jest.fn() },
  User: { findByPk: jest.fn() },
  Class: { findByPk: jest.fn() },
};

const mockHelpers = {
  logAudit: jest.fn(),
  logActivity: jest.fn(),
  notifyUsers: jest.fn(),
};

jest.mock("../src/models", () => mockModels);
jest.mock("../src/helpers", () => mockHelpers);

const ClassUserService = require("../src/services/classUser.service");

describe("ClassUserService reviewer assignments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("assigns a Reviewer to a class", async () => {
    mockModels.User.findByPk.mockResolvedValue({ id: 9, role: "Reviewer" });
    mockModels.ClassUser.findOne.mockResolvedValue(null);
    mockModels.ClassUser.create.mockResolvedValue({ id: 12, ClassId: 3, UserId: 9, roleInClass: "Reviewer" });

    await expect(ClassUserService.assignReviewer(
      { ClassId: 3, UserId: 9 },
      { id: 1, role: "Admin" },
    )).resolves.toMatchObject({ roleInClass: "Reviewer" });

    expect(mockModels.ClassUser.create).toHaveBeenCalledWith(expect.objectContaining({
      ClassId: 3,
      UserId: 9,
      roleInClass: "Reviewer",
    }));
  });

  it("rejects assignments for a user without the Reviewer role", async () => {
    mockModels.User.findByPk.mockResolvedValue({ id: 9, role: "Mentor" });

    await expect(ClassUserService.assignReviewer(
      { ClassId: 3, UserId: 9 },
      { id: 1, role: "Admin" },
    )).rejects.toThrow("Reviewer not found");
  });

  it("rejects duplicate class assignments", async () => {
    mockModels.User.findByPk.mockResolvedValue({ id: 9, role: "Reviewer" });
    mockModels.ClassUser.findOne.mockResolvedValue({ id: 12 });

    await expect(ClassUserService.assignReviewer(
      { ClassId: 3, UserId: 9 },
      { id: 1, role: "Admin" },
    )).rejects.toThrow("Reviewer is already assigned to this class");
  });
});
