const mockModels = {
  HistoryClass: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn(),
  },
  Class: {
    findByPk: jest.fn(),
  },
  User: {},
  ClassUser: {
    findAll: jest.fn(),
  },
  Meeting: {
    count: jest.fn(),
  },
  Attendance: {
    findAll: jest.fn(),
  },
  AssessmentResult: {
    findAll: jest.fn(),
  },
  TaskSubmission: {},
  Task: {},
};

const mockHelpers = {
  logAudit: jest.fn(),
  notifyUsers: jest.fn(),
};

jest.mock("../src/models", () => mockModels);
jest.mock("../src/helpers", () => mockHelpers);
jest.mock("../src/config/cloudinary", () => ({
  assertConfigured: jest.fn(),
  uploader: { upload_stream: jest.fn() },
}));
jest.mock("../src/services/certificate.service", () => ({
  createCertificateBuffer: jest.fn(),
  makeCertificateId: jest.fn(),
}));

const HistoryClassService = require("../src/services/historyClass.service");

describe("HistoryClassService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calculates participant score and attendance progress", async () => {
    mockModels.AssessmentResult.findAll.mockResolvedValue([
      { finalScore: 80 },
      { finalScore: 95 },
    ]);
    mockModels.Attendance.findAll.mockResolvedValue([
      { status: "Present" },
      { status: "Late" },
      { status: "Absent" },
    ]);
    mockModels.Meeting.count.mockResolvedValue(4);

    await expect(HistoryClassService.getParticipantProgress(12, 7)).resolves.toEqual({
      finalScore: 87.5,
      attendancePercentage: 50,
    });

    expect(mockModels.Meeting.count).toHaveBeenCalledWith({ where: { ClassId: 12 } });
  });

  it("archives every participant and notifies them", async () => {
    const cls = { id: 12, name: "React Fundamentals", update: jest.fn() };
    const participants = [
      { UserId: 7, roleInClass: "Mentee", User: { role: "Mentee" } },
      { UserId: 8, roleInClass: "Mentor", User: { role: "Mentor" } },
    ];
    const progress = jest.spyOn(HistoryClassService, "getParticipantProgress")
      .mockResolvedValue({ finalScore: 90, attendancePercentage: 100 });

    mockModels.Class.findByPk.mockResolvedValue(cls);
    mockModels.ClassUser.findAll.mockResolvedValue(participants);
    mockModels.HistoryClass.findOne.mockResolvedValue(null);
    mockModels.HistoryClass.create.mockImplementation((record) => Promise.resolve(record));

    const result = await HistoryClassService.archive(12, { id: 1, role: "Admin" });

    expect(result).toHaveLength(2);
    expect(progress).toHaveBeenCalledTimes(2);
    expect(cls.update).toHaveBeenCalledWith({ status: "Archived" });
    expect(mockHelpers.notifyUsers).toHaveBeenCalledWith(expect.objectContaining({
      userIds: [7, 8],
      title: "Class Archived",
      ClassId: 12,
    }));
    expect(mockHelpers.logAudit).toHaveBeenCalledWith(expect.objectContaining({
      resource: "HistoryClass",
      resourceId: 12,
    }));

    progress.mockRestore();
  });

  it("restores a class, removes all of its history records, and notifies participants", async () => {
    const cls = { id: 12, name: "React Fundamentals", update: jest.fn() };
    mockModels.HistoryClass.findByPk.mockResolvedValue({ id: 99, ClassId: 12 });
    mockModels.HistoryClass.findAll.mockResolvedValue([{ UserId: 7 }, { UserId: 8 }]);
    mockModels.HistoryClass.destroy.mockResolvedValue(2);
    mockModels.Class.findByPk.mockResolvedValue(cls);

    await expect(HistoryClassService.restore(99, { id: 1, role: "Owner" }))
      .resolves.toEqual({
        message: "Class restored successfully",
        restoredHistoryCount: 2,
      });

    expect(cls.update).toHaveBeenCalledWith({ status: "Active" });
    expect(mockModels.HistoryClass.destroy).toHaveBeenCalledWith({
      where: { ClassId: 12 },
    });
    expect(mockHelpers.notifyUsers).toHaveBeenCalledWith(expect.objectContaining({
      userIds: [7, 8],
      title: "Class Restored",
      ClassId: 12,
    }));
  });

  it("rejects archive attempts from roles without archive permission", async () => {
    await expect(HistoryClassService.archive(12, { id: 7, role: "Mentor" }))
      .rejects.toThrow("Permission denied");

    expect(mockModels.Class.findByPk).not.toHaveBeenCalled();
  });
});
