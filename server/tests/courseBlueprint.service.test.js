const mockModels = {
  CourseBlueprint: { create: jest.fn(), findAll: jest.fn(), findByPk: jest.fn(), update: jest.fn() },
  BlueprintMeeting: { create: jest.fn(), findByPk: jest.fn(), max: jest.fn(), count: jest.fn() },
  BlueprintMaterial: { create: jest.fn(), findByPk: jest.fn(), max: jest.fn() },
  BlueprintTask: { create: jest.fn(), findByPk: jest.fn(), max: jest.fn() },
  User: {},
};

const mockHelpers = { logAudit: jest.fn() };

jest.mock("../src/models", () => mockModels);
jest.mock("../src/helpers", () => mockHelpers);

const CourseBlueprintService = require("../src/services/courseBlueprint.service");

describe("CourseBlueprintService", () => {
  beforeEach(() => jest.clearAllMocks());

  it("allows an Admin to create a master curriculum", async () => {
    const record = { id: 4, code: "WEB-101", name: "Web Foundations" };
    mockModels.CourseBlueprint.create.mockResolvedValue(record);

    await expect(CourseBlueprintService.create(
      { code: "WEB-101", name: "Web Foundations" },
      { id: 1, role: "Admin" },
    )).resolves.toEqual(record);

    expect(mockModels.CourseBlueprint.create).toHaveBeenCalledWith(expect.objectContaining({ createdBy: 1, updatedBy: 1 }));
  });

  it("prevents a Mentor from changing the master curriculum", async () => {
    await expect(CourseBlueprintService.create(
      { code: "WEB-101", name: "Web Foundations" },
      { id: 2, role: "Mentor" },
    )).rejects.toThrow("Permission denied");
  });

  it("assigns the next sequence and synchronizes total meetings", async () => {
    mockModels.CourseBlueprint.findByPk.mockResolvedValue({ id: 4 });
    mockModels.BlueprintMeeting.max.mockResolvedValue(2);
    mockModels.BlueprintMeeting.create.mockResolvedValue({ id: 9, title: "JavaScript" });
    mockModels.BlueprintMeeting.count.mockResolvedValue(3);

    await CourseBlueprintService.createMeeting(4, { title: "JavaScript" }, { id: 1, role: "Owner" });

    expect(mockModels.BlueprintMeeting.create).toHaveBeenCalledWith(expect.objectContaining({ CourseBlueprintId: 4, sequence: 3 }));
    expect(mockModels.CourseBlueprint.update).toHaveBeenCalledWith({ totalMeetings: 3, updatedBy: 1 }, { where: { id: 4 } });
  });
});
