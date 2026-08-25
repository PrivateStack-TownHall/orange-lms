const { User, Profile, Class, Meeting, Task } = require("../models");
const { bcrypt } = require("../helpers");

class MentorService {
  static async create({ email, password, name }) {
    const hashedPassword = await bcrypt.hashPassword(password);

    return User.create({
      email,
      password: hashedPassword,
      role: "Mentor",
      name,
    });
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
              through: { attributes: [] },
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

    return this.findById(id);
  }

  static async delete(id) {
    const user = await User.findByPk(id);

    if (!user) throw new Error("Mentor not found");

    await Profile.destroy({
      where: { UserId: id },
    });

    await user.destroy();

    return true;
  }
}

module.exports = MentorService;
