const meetingService = require("./meeting.service");
const taskService = require("./task.service");

class CalendarService {
  static async getEvents(currentUser, { start, end, classId } = {}) {
    const [meetings, tasks] = await Promise.all([
      meetingService.getAll(currentUser),
      taskService.getAll(currentUser),
    ]);
    const from = start ? new Date(start) : null;
    const to = end ? new Date(end) : null;
    const inRange = (date) => {
      if (!date) return false;
      const value = new Date(date);
      return (!from || value >= from) && (!to || value <= to);
    };
    const matchesClass = (value) => !classId || Number(value) === Number(classId);

    return [
      ...meetings
        .filter((meeting) => matchesClass(meeting.ClassId) && inRange(meeting.meetingDate))
        .map((meeting) => ({
          id: `meeting-${meeting.id}`,
          resourceId: meeting.id,
          type: "Meeting",
          title: meeting.name,
          date: meeting.meetingDate,
          ClassId: meeting.ClassId,
          className: meeting.class?.name || "",
          classCode: meeting.class?.code || "",
          detailUrl: `/meetings/${meeting.id}`,
        })),
      ...tasks
        .filter((task) => matchesClass(task.ClassId) && inRange(task.dueDate))
        .map((task) => ({
          id: `task-${task.id}`,
          resourceId: task.id,
          type: "Task",
          title: task.name,
          date: task.dueDate,
          ClassId: task.ClassId,
          className: task.Class?.name || "",
          classCode: task.Class?.code || "",
          detailUrl: `/tasks/${task.id}`,
        })),
    ].sort((left, right) => new Date(left.date) - new Date(right.date));
  }
}

module.exports = CalendarService;
