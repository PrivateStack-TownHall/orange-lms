"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    static associate(models) {
      Profile.belongsTo(models.User, {
        foreignKey: "UserId",
        as: "user",
      });
    }
  }

  Profile.init(
    {
      UserId: DataTypes.INTEGER,
      age: DataTypes.INTEGER,
      gender: DataTypes.STRING,
      address: DataTypes.STRING,
      city: DataTypes.STRING,
      country: DataTypes.STRING,
      background: DataTypes.TEXT,
      phoneNumber: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Profile",
    },
  );

  return Profile;
};
