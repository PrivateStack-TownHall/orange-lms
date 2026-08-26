const { User, Profile } = require("../models");
const { bcrypt, jwt, logAudit, logActivity } = require("../helpers");

class AuthService {
  static async register({ name, email, password, role }, meta = {}) {
    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "Mentee",
    });

    await Profile.create({
      UserId: user.id,
    });

    await logAudit({
      user,
      action: "CREATE",
      resource: "User",
      resourceId: user.id,
      resourceDetail: user.name,
      meta,
    });

    return user;
  }

  static async login({ email, password }, meta = {}) {
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const valid = await bcrypt.comparePassword(password, user.password);

    if (!valid) {
      throw new Error("Invalid credentials");
    }

    const access_token = jwt.generateToken({
      id: user.id,
      role: user.role,
      email: user.email,
    });

    await logAudit({
      user,
      action: "LOGIN",
      resource: "Auth",
      resourceId: user.id,
      resourceDetail: user.name,
      meta,
    });

    await logActivity({
      user,
      activity: "Logged In",
      description: "User logged in to the system",
      resourceType: "Auth",
      meta,
    });

    return { access_token };
  }

  static async logout(currentUser, meta = {}) {
    await logAudit({
      user: currentUser,
      action: "LOGOUT",
      resource: "Auth",
      resourceId: currentUser.id,
      meta,
    });

    await logActivity({
      user: currentUser,
      activity: "Logged Out",
      description: "User logged out from the system",
      resourceType: "Auth",
      meta,
    });

    return true;
  }

  static async me(userData) {
    return User.findByPk(userData.id, {
      attributes: {
        exclude: ["password"],
      },
      include: {
        model: Profile,
        as: "profile",
      },
    });
  }
}

module.exports = AuthService;
