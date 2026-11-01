const mockModels = {
  User: { findAll: jest.fn() },
  Class: { findAll: jest.fn() },
  Meeting: {},
  Task: {},
  TaskSubmission: { findAll: jest.fn() },
  AssessmentResult: {},
  Attendance: { findAll: jest.fn() },
  ClassUser: {},
};

jest.mock("../src/models", () => mockModels);

const ReportsService = require("../src/services/reports.service");

describe("ReportsService.getDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockModels.Class.findAll.mockResolvedValue([]);
    mockModels.User.findAll.mockResolvedValue([]);
    mockModels.TaskSubmission.findAll.mockResolvedValue([]);
    mockModels.Attendance.findAll.mockResolvedValue([]);
  });

  it("locks Mentor analytics to the mentor's own classes", async () => {
    const result = await ReportsService.getDashboard(
      { MentorId: 99, ClassId: 3, status: "Active" },
      { id: 7, role: "Mentor" },
    );

    expect(mockModels.Class.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: 3, MentorId: 7, status: "Active" }),
    }));
    expect(mockModels.User.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: [7] },
    }));
    expect(result).toMatchObject({
      scope: "Mentor",
      filters: { ClassId: 3, MentorId: 7, status: "Active" },
    });
  });

  it("applies a date range to meeting, submission, and attendance queries", async () => {
    await ReportsService.getDashboard(
      { startDate: "2026-01-01", endDate: "2026-01-31" },
      { id: 1, role: "Admin" },
    );

    const classQuery = mockModels.Class.findAll.mock.calls[0][0];
    const meetingInclude = classQuery.include.find((item) => item.as === "meetings");

    expect(meetingInclude.where.meetingDate).toBeDefined();
    expect(mockModels.TaskSubmission.findAll.mock.calls[0][0].where.submittedAt).toBeDefined();
    expect(mockModels.Attendance.findAll.mock.calls[0][0].where.createdAt).toBeDefined();
  });

  it("rejects an invalid date range", async () => {
    await expect(ReportsService.getDashboard(
      { startDate: "2026-02-01", endDate: "2026-01-01" },
      { id: 1, role: "Owner" },
    )).rejects.toThrow("startDate must be before endDate");
  });
});
