const { User, Profile, Class, Meeting, Task } = require("../models");
const { bcrypt, logAudit } = require("../helpers");

class MenteeService {
  static async create({ email, password, name }, currentUser, meta = {}) {
    const hashedPassword = await bcrypt.hashPassword(password);

    const mentee = await User.create({
      email,
      password: hashedPassword,
      role: "Mentee",
      name,
    });

    await logAudit({
      user: currentUser,
      action: "CREATE",
      resource: "User",
      resourceId: mentee.id,
      resourceDetail: `Mentee: ${mentee.name}`,
      meta,
    });

    return mentee;
  }

  static async findAll() {
    return User.findAll({
      where: {
        role: "Mentee",
      },

      include: [
        {
          model: Profile,
          as: "profile",
        },
        {
          model: Class,
          as: "enrolledClasses",
          through: { attributes: [], where: { roleInClass: "Mentee" } },
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
        role: "Mentee",
      },

      include: [
        {
          model: Profile,
          as: "profile",
        },
        {
          model: Class,
          as: "enrolledClasses",
          through: { attributes: [], where: { roleInClass: "Mentee" } },

          include: [
            {
              model: Meeting,
              as: "meetings",
            },
            {
              model: User,
              as: "mentor",
              attributes: ["id", "name"],
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
      throw new Error("Mentee not found");
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
      resourceDetail: `Mentee: ${user.name}`,
      meta,
    });

    return this.findById(id);
  }

  static async delete(id, currentUser, meta = {}) {
    const user = await User.findByPk(id);

    if (!user) throw new Error("Mentee not found");

    await Profile.destroy({
      where: { UserId: id },
    });

    await logAudit({
      user: currentUser,
      action: "DELETE",
      resource: "User",
      resourceId: user.id,
      resourceDetail: `Mentee: ${user.name}`,
      meta,
    });

    await user.destroy();

    return true;
  }
}

module.exports = MenteeService;
