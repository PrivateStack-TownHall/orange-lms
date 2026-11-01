const mockModels = {
  User: {},
  Class: { create: jest.fn() },
  Meeting: { create: jest.fn() },
  Task: { create: jest.fn() },
  Note: {},
  Material: { create: jest.fn() },
  Attendance: {},
  TaskSubmission: {},
  AssessmentResult: {},
  ClassUser: {},
  CourseBlueprint: { findByPk: jest.fn() },
  BlueprintMeeting: {},
  BlueprintMaterial: {},
  BlueprintTask: {},
  sequelize: { transaction: jest.fn() },
};

const mockHelpers = { logAudit: jest.fn() };

jest.mock("../src/models", () => mockModels);
jest.mock("../src/helpers", () => mockHelpers);

const ClassService = require("../src/services/class.service");

describe("ClassService blueprint batches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockModels.sequelize.transaction.mockImplementation(async (callback) => callback({}));
  });

  it("generates recurring meeting dates on selected weekdays", () => {
    const dates = ClassService.generateMeetingDates("2026-11-02", 3, [2, 4]);

    expect(dates.map((date) => date.toISOString().slice(0, 10))).toEqual([
      "2026-11-03",
      "2026-11-05",
      "2026-11-10",
    ]);
  });

  it("clones meetings, materials, and tasks from a published blueprint", async () => {
    mockModels.CourseBlueprint.findByPk.mockResolvedValue({
      id: 5,
      code: "WEB-101",
      status: "Published",
      meetings: [{
        id: 20,
        sequence: 1,
        title: "HTML Foundations",
        description: "Semantic HTML",
        durationMinutes: 120,
        materials: [{ id: 30, name: "Slides", type: "Slide", fileUrl: "https://example.test/slides" }],
        tasks: [{ id: 40, name: "Build markup", dueOffsetDays: 2, maxScore: 100, status: "Published" }],
      }],
    });
    mockModels.Class.create.mockResolvedValue({ id: 100, name: "Batch 12" });
    mockModels.Meeting.create.mockResolvedValue({ id: 200 });
    mockModels.Material.create.mockResolvedValue({ id: 300 });
    mockModels.Task.create.mockResolvedValue({ id: 400 });

    await ClassService.createFromBlueprint({
      CourseBlueprintId: 5,
      code: "BATCH-12",
      name: "Batch 12",
      startDate: "2026-11-02",
      meetingDays: [2],
      startHour: "19:00",
      deliveryMode: "Online",
      meetingUrl: "https://meet.example.test/batch-12",
    }, { id: 1, role: "Admin" });

    expect(mockModels.Class.create).toHaveBeenCalledWith(expect.objectContaining({ CourseBlueprintId: 5, createdBy: 1 }), expect.any(Object));
    expect(mockModels.Meeting.create).toHaveBeenCalledWith(expect.objectContaining({ BlueprintMeetingId: 20, ClassId: 100, meetingNumber: 1, finishHour: "21:00:00" }), expect.any(Object));
    expect(mockModels.Material.create).toHaveBeenCalledWith(expect.objectContaining({ BlueprintMaterialId: 30, MeetingId: 200, ClassId: 100 }), expect.any(Object));
    expect(mockModels.Task.create).toHaveBeenCalledWith(expect.objectContaining({ BlueprintTaskId: 40, MeetingId: 200, ClassId: 100, createdBy: 1 }), expect.any(Object));
  });

  it("rejects a blueprint that is not published", async () => {
    mockModels.CourseBlueprint.findByPk.mockResolvedValue({ id: 5, status: "Draft", meetings: [] });

    await expect(ClassService.createFromBlueprint({
      CourseBlueprintId: 5,
      startDate: "2026-11-02",
      meetingDays: [2],
    }, { id: 1, role: "Owner" })).rejects.toThrow("Course blueprint must be published");
  });
});
