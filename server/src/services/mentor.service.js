const { User, Profile, Class, Meeting, Task } = require("../models");
const { bcrypt, logAudit } = require("../helpers");

class MentorService {
  static async create({ email, password, name }, currentUser, meta = {}) {
    const hashedPassword = await bcrypt.hashPassword(password);

    const mentor = await User.create({
      email,
      password: hashedPassword,
      role: "Mentor",
      name,
    });

    await logAudit({
      user: currentUser,
      action: "CREATE",
      resource: "User",
      resourceId: mentor.id,
      resourceDetail: `Mentor: ${mentor.name}`,
      meta,
    });

    return mentor;
  }

  static async findAll() {
    return User.findAll({
      where: {
        role: "Mentor",
      },

      include: [
        {
          model: Profile,
          as: "profile",
        },
        {
          model: Class,
          as: "mentoredClasses",
        },
      ],

      attributes: {
        exclude: ["password"],
      },
    });
  }

  static async findById(id) {
    return User.findOne({
      where: {
        id,
        role: "Mentor",
      },

      include: [
        {
          model: Profile,
          as: "profile",
        },
        {
          model: Class,
          as: "mentoredClasses",

          include: [
            {
              model: Meeting,
              as: "meetings",
            },
            {
              model: User,
              as: "mentees",
              attributes: ["id", "name", "email"],
              through: { attributes: [], where: { roleInClass: "Mentee" } },
            },
            {
              model: Task,
              as: "tasks",
              attributes: ["id", "name"],
            },
          ],
        },
      ],

      attributes: {
        exclude: ["password"],
      },
    });
  }

  static async update(id, data, currentUser, meta = {}) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new Error("Mentor not found");
    }

    await user.update({
      name: data.name,
      email: data.email,
      avatarUrl: data.avatarUrl,
    });

    const profile = await Profile.findOne({
      where: {
        UserId: id,
      },
    });

    if (profile) {
      await profile.update({
        age: data.age,
        city: data.city,
        background: data.background,
        phoneNumber: data.phoneNumber,
      });
    }

    await logAudit({
      user: currentUser,
      action: "UPDATE",
      resource: "User",
      resourceId: user.id,
      resourceDetail: `Mentor: ${user.name}`,
      meta,
    });

    return this.findById(id);
  }

  static async delete(id, currentUser, meta = {}) {
    const user = await User.findByPk(id);

    if (!user) throw new Error("Mentor not found");

    await Profile.destroy({
      where: { UserId: id },
    });

    await logAudit({
      user: currentUser,
      action: "DELETE",
      resource: "User",
      resourceId: user.id,
      resourceDetail: `Mentor: ${user.name}`,
      meta,
    });

    await user.destroy();

    return true;
  }
}

module.exports = MentorService;
