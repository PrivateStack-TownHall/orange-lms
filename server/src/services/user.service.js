const { User, Profile } = require("../models");
const { bcrypt, logAudit, logActivity } = require("../helpers");

class UserService {
  static async create({ email, password, role, name }, currentUser, meta = {}) {
    const hashedPassword = await bcrypt.hashPassword(password);

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      name,
    });

    await logAudit({
      user: currentUser,
      action: "CREATE",
      resource: "User",
      resourceId: user.id,
      resourceDetail: user.name,
      meta,
    });

    return user;
  }

  static async findAll(filters = {}) {
    const where = {};

    if (filters.role) {
      where.role = filters.role;
    }

    return User.findAll({
      where,

      order: [["id", "ASC"]],

      include: {
        model: Profile,
        as: "profile",
      },

      attributes: {
        exclude: ["password"],
      },
    });
  }

  static async findById(id) {
    return User.findByPk(id, {
      include: {
        model: Profile,
        as: "profile",
      },

      attributes: {
        exclude: ["password"],
      },
    });
  }

  static async update(id, data, currentUser, meta = {}) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === "Owner" && currentUser.role !== "Owner") {
      throw new Error("Cannot update owner");
    }

    const payload = {
      name: data.name,
      email: data.email,
      avatarUrl: data.avatarUrl,
    };

    const previousRole = user.role;
    const previousStatus = user.isActive;

    if (["Owner", "Admin"].includes(currentUser.role)) {
      payload.role = data.role;
      payload.isActive = data.isActive;
    }

    if (data.password?.trim()) {
      payload.password = await bcrypt.hashPassword(data.password);
    }

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    await user.update(payload);

    // Role/status changes get their own dedicated audit action so they
    // surface distinctly in the Audit Log ("ROLE_CHANGE" / "STATUS_CHANGE").
    if (payload.role !== undefined && payload.role !== previousRole) {
      await logAudit({
        user: currentUser,
        action: "ROLE_CHANGE",
        resource: "User",
        resourceId: user.id,
        resourceDetail: `${user.name}: ${previousRole} -> ${payload.role}`,
        meta,
      });
    } else if (payload.isActive !== undefined && payload.isActive !== previousStatus) {
      await logAudit({
        user: currentUser,
        action: "STATUS_CHANGE",
        resource: "User",
        resourceId: user.id,
        resourceDetail: `${user.name}: ${payload.isActive ? "Active" : "Inactive"}`,
        meta,
      });
    } else {
      await logAudit({
        user: currentUser,
        action: "UPDATE",
        resource: "User",
        resourceId: user.id,
        resourceDetail: user.name,
        meta,
      });
    }

    if (currentUser.id === user.id) {
      await logActivity({
        user: currentUser,
        activity: "Updated Profile",
        description: "Updated profile information",
        resourceType: "Profile",
        resourceId: user.id,
        meta,
      });
    }

    return this.findById(id);
  }

  static async delete(id, currentUser, meta = {}) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === "Owner" && currentUser.role !== "Owner") {
      throw new Error("Cannot delete owner");
    }

    await Profile.destroy({
      where: {
        UserId: id,
      },
    });

    await logAudit({
      user: currentUser,
      action: "DELETE",
      resource: "User",
      resourceId: user.id,
      resourceDetail: user.name,
      meta,
    });

    await user.destroy();

    return true;
  }
}

module.exports = UserService;
