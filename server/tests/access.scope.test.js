const mockModels = {
  Task: { findByPk: jest.fn() },
  Note: { findByPk: jest.fn() },
  Material: { findByPk: jest.fn() },
  Meeting: { findByPk: jest.fn() },
  Class: { findByPk: jest.fn() },
  User: {},
  Attendance: { findOne: jest.fn(), create: jest.fn() },
  ClassUser: { findOne: jest.fn() },
  MentorSubstitution: { findAll: jest.fn() },
  TaskCriteria: { findByPk: jest.fn(), sum: jest.fn(), count: jest.fn(), create: jest.fn() },
  TaskSubmission: { create: jest.fn() },
};

const mockHelpers = {
  logAudit: jest.fn(),
  logActivity: jest.fn(),
  notifyUsers: jest.fn(),
};

jest.mock("../src/models", () => mockModels);
jest.mock("../src/helpers", () => mockHelpers);

const TaskService = require("../src/services/task.service");
const NoteService = require("../src/services/note.service");
const AttendanceService = require("../src/services/attendance.service");
const TaskCriteriaService = require("../src/services/taskCriteria.service");
const TaskSubmissionService = require("../src/services/taskSubmission.service");

const mentor = { id: 7, role: "Mentor" };

describe("class-scoped CRUD access", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockModels.MentorSubstitution.findAll.mockResolvedValue([]);
  });

  it("prevents a mentor from updating a task in another mentor's class", async () => {
    mockModels.Task.findByPk.mockResolvedValue({
      id: 3,
      ClassId: 9,
      Class: { id: 9, MentorId: 8 },
      update: jest.fn(),
    });

    await expect(TaskService.update(3, { name: "Changed" }, mentor))
      .rejects.toThrow("Permission denied");
  });

  it("prevents a mentor from creating a note for another mentor's meeting", async () => {
    mockModels.Meeting.findByPk.mockResolvedValue({ id: 4, ClassId: 9 });
    mockModels.Class.findByPk.mockResolvedValue({ id: 9, MentorId: 8 });

    await expect(NoteService.create(mentor, 4, { name: "Private note" }))
      .rejects.toThrow("Permission denied");
  });

  it("rejects attendance for a user who is not enrolled in the meeting class", async () => {
    mockModels.Meeting.findByPk.mockResolvedValue({ id: 4, ClassId: 9 });
    mockModels.Class.findByPk.mockResolvedValue({ id: 9, MentorId: 7 });
    mockModels.ClassUser.findOne.mockResolvedValue(null);

    await expect(AttendanceService.markAttendance(mentor, {
      MeetingId: 4,
      UserId: 12,
      status: "Present",
    })).rejects.toThrow("Mentee is not enrolled in this class");
  });

  it("prevents a mentor from adding criteria to another mentor's task", async () => {
    mockModels.Task.findByPk.mockResolvedValue({
      id: 3,
      Class: { id: 9, MentorId: 8 },
    });

    await expect(TaskCriteriaService.create(mentor, {
      TaskId: 3,
      title: "Quality",
      percentage: 100,
    })).rejects.toThrow("Permission denied");
  });

  it("prevents a mentee from submitting a task outside their enrolled class", async () => {
    mockModels.Task.findByPk.mockResolvedValue({ id: 3, ClassId: 9 });
    mockModels.ClassUser.findOne.mockResolvedValue(null);

    await expect(TaskSubmissionService.create(
      { id: 12, role: "Mentee" },
      { TaskId: 3, submissionUrl: "https://example.test/work" },
    )).rejects.toThrow("Permission denied");
  });
});
