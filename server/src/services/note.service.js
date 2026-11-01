const { Note, Meeting, Class, User } = require("../models");
const ROLES = require("../constants/roles");
const { logAudit, logActivity } = require("../helpers");

class NoteService {
  static async findAllByMeeting(MeetingId) {
    return Note.findAll({
      where: { MeetingId },
      include: [
        Meeting,
        Class,
        {
          model: User,
          as: "creator",
        },
      ],
    });
  }

  static async getAll(currentUser) {
    /**
     * Owner & Admin
     */
    if ([ROLES.OWNER, ROLES.ADMIN].includes(currentUser.role)) {
      return Note.findAll({
        include: [
          Meeting,
          Class,
          {
            model: User,
            as: "creator",
          },
        ],
      });
    }

    /**
     * Mentor
     */
    if (currentUser.role === ROLES.MENTOR) {
      return Note.findAll({
        include: [
          Meeting,
          {
            model: Class,
            where: {
              MentorId: currentUser.id,
            },
          },
          {
            model: User,
            as: "creator",
          },
        ],
      });
    }

    /**
     * Mentee
     */
    if (currentUser.role === ROLES.MENTEE) {
      return Note.findAll({
        include: [
          Meeting,
          {
            model: Class,
            required: true,
            include: [
              {
                model: User,
                as: "mentees",
                attributes: [],
                through: {
                  attributes: [],
                  where: { roleInClass: "Mentee" },
                },
                where: {
                  id: currentUser.id,
                },
              },
            ],
          },
          {
            model: User,
            as: "creator",
          },
        ],
      });
    }

    throw new Error("Unauthorized");
  }

  static async findById(id) {
    return Note.findByPk(id, {
      include: [
        Meeting,
        Class,
        {
          model: User,
          as: "creator",
        },
      ],
    });
  }

  static async create(currentUser, meetingId, data, meta = {}) {
    if (![ROLES.ADMIN, ROLES.OWNER, ROLES.MENTOR].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const meeting = await Meeting.findByPk(meetingId);

    if (!meeting) {
      throw new Error("Meeting not found");
    }

    await this.assertMentorClassAccess(meeting.ClassId, currentUser);

    const note = await Note.create({
      ...data,
      MeetingId: Number(meetingId),
      ClassId: meeting.ClassId,
      createdBy: currentUser.id,
    });

    await logAudit({
      user: currentUser,
      action: "CREATE",
      resource: "Note",
      resourceId: note.id,
      resourceDetail: note.name,
      meta,
    });

    await logActivity({
      user: currentUser,
      activity: "Created Note",
      description: `Created a new note "${note.name}"`,
      ClassId: meeting.ClassId,
      resourceType: "Note",
      resourceId: note.id,
      meta,
    });

    return note;
  }

  static async update(id, data, currentUser, meta = {}) {
    if (![ROLES.ADMIN, ROLES.OWNER, ROLES.MENTOR].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const note = await Note.findByPk(id, { include: [Class] });

    if (!note) {
      throw new Error("Note not found");
    }

    await this.assertMentorClassAccess(note.ClassId, currentUser, note.Class);

    await note.update(data);

    await logAudit({
      user: currentUser,
      action: "UPDATE",
      resource: "Note",
      resourceId: note.id,
      resourceDetail: note.name,
      meta,
    });

    return note;
  }

  static async delete(id, currentUser, meta = {}) {
    if (![ROLES.ADMIN, ROLES.OWNER, ROLES.MENTOR].includes(currentUser.role)) {
      throw new Error("Permission denied");
    }

    const note = await Note.findByPk(id, { include: [Class] });

    if (!note) {
      throw new Error("Note not found");
    }

    await this.assertMentorClassAccess(note.ClassId, currentUser, note.Class);

    await logAudit({
      user: currentUser,
      action: "DELETE",
      resource: "Note",
      resourceId: note.id,
      resourceDetail: note.name,
      meta,
    });

    return note.destroy();
  }

  static async assertMentorClassAccess(ClassId, currentUser, cls) {
    if (currentUser.role !== ROLES.MENTOR) return;

    const targetClass = cls || await Class.findByPk(ClassId);

    if (!targetClass || targetClass.MentorId !== currentUser.id) {
      throw new Error("Permission denied");
    }
  }
}

module.exports = NoteService;
