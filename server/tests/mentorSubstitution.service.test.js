const mockModels = {
  Class: { findByPk: jest.fn(), findAll: jest.fn() },
  Meeting: { findByPk: jest.fn() },
  MentorSubstitution: {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  },
  User: { findByPk: jest.fn() },
};

const mockHelpers = {
  logAudit: jest.fn(),
  notifyUsers: jest.fn(),
};

jest.mock("../src/models", () => mockModels);
jest.mock("../src/helpers", () => mockHelpers);

const MentorSubstitutionService = require("../src/services/mentorSubstitution.service");

const admin = { id: 1, role: "Admin", name: "Academic Admin" };
const substitute = { id: 7, role: "Mentor", name: "Mentor Replacement", isActive: true };

describe("MentorSubstitutionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a class-wide assignment without changing the primary mentor", async () => {
    mockModels.Class.findByPk.mockResolvedValue({ id: 10, name: "Full Stack Batch 12", MentorId: 4 });
    mockModels.User.findByPk.mockResolvedValue(substitute);
    mockModels.MentorSubstitution.findOne.mockResolvedValue(null);
    mockModels.MentorSubstitution.create.mockResolvedValue({ id: 20, ClassId: 10, MentorId: 7 });

    await MentorSubstitutionService.create(10, {
      MentorId: 7,
      reason: "Primary mentor is on leave",
      startAt: "2026-11-03T09:00:00.000Z",
    }, admin);

    expect(mockModels.MentorSubstitution.create).toHaveBeenCalledWith(expect.objectContaining({
      ClassId: 10,
      MeetingId: null,
      MentorId: 7,
      assignedBy: 1,
      status: "Active",
    }));
    expect(mockModels.Class.findByPk).toHaveBeenCalledWith(10);
    expect(mockHelpers.logAudit).toHaveBeenCalledWith(expect.objectContaining({
      resource: "MentorSubstitution",
      action: "CREATE",
    }));
  });

  it("rejects a meeting assignment outside the selected class", async () => {
    mockModels.Class.findByPk.mockResolvedValue({ id: 10, name: "Full Stack Batch 12", MentorId: 4 });
    mockModels.User.findByPk.mockResolvedValue(substitute);
    mockModels.Meeting.findByPk.mockResolvedValue({ id: 30, ClassId: 99 });

    await expect(MentorSubstitutionService.create(10, {
      MentorId: 7,
      MeetingId: 30,
    }, admin)).rejects.toThrow("Meeting does not belong to this class");
  });

  it("permits a substitute only for the meeting that was assigned", async () => {
    mockModels.Class.findByPk.mockResolvedValue({ id: 10, MentorId: 4 });
    mockModels.MentorSubstitution.findAll.mockResolvedValue([{ MeetingId: 30 }]);

    await expect(MentorSubstitutionService.assertCanAccess({
      ClassId: 10,
      MeetingId: 30,
      currentUser: substitute,
    })).resolves.toBeUndefined();

    await expect(MentorSubstitutionService.assertCanAccess({
      ClassId: 10,
      MeetingId: 31,
      currentUser: substitute,
    })).rejects.toThrow("Permission denied");
  });

  it("combines a mentor's primary classes and active class-wide substitutions", async () => {
    mockModels.Class.findAll.mockResolvedValue([{ id: 5 }]);
    mockModels.MentorSubstitution.findAll.mockResolvedValue([
      { ClassId: 10, MeetingId: null },
      { ClassId: 12, MeetingId: 31 },
    ]);

    await expect(MentorSubstitutionService.getScope(substitute)).resolves.toEqual({
      classIds: [5, 10],
      meetingIds: [31],
    });
  });
});
