const { Profile } = require("../models");
const { logActivity } = require("../helpers");

class ProfileService {
  static async findByUserId(UserId) {
    return Profile.findOne({
      where: { UserId },
    });
  }

  static async upsert(UserId, data) {
    const profile = await Profile.findOne({
      where: { UserId },
    });

    let result;

    if (profile) {
      result = await profile.update(data);
    } else {
      result = await Profile.create({
        UserId,
        ...data,
      });
    }

    await logActivity({
      user: { id: UserId },
      activity: "Updated Profile",
      description: "Updated profile information",
      resourceType: "Profile",
      resourceId: UserId,
    });

    return result;
  }
}

module.exports = ProfileService;
