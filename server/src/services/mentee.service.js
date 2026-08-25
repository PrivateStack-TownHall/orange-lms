const { User, Profile, Class, Meeting, Task } = require("../models");
const { bcrypt } = require("../helpers");

class MenteeService {
  static async create({ email, password, name }) {
    const hashedPassword = await bcrypt.hashPassword(password);

    return User.create({
      email,
      password: hashedPassword,
      role: "Mentee",
      name,
    });
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

  static async update(id, data) {
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
  }

  static async delete(id) {
    const user = await User.findByPk(id);

    if (!user) throw new Error("Mentee not found");

    await Profile.destroy({
      where: { UserId: id },
    });

    await user.destroy();

    return true;
  }
}

module.exports = MenteeService;
