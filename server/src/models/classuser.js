"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ClassUser extends Model {
    static associate(models) {
      ClassUser.belongsTo(models.User, {
        foreignKey: "UserId",
      });

      ClassUser.belongsTo(models.Class, {
        foreignKey: "ClassId",
      });
    }
  }

  ClassUser.init(
    {
      ClassId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER,
      roleInClass: DataTypes.STRING,
      progressPercentage: DataTypes.DECIMAL,
      status: DataTypes.STRING,
      assignedBy: DataTypes.INTEGER,
      joinedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "ClassUser",
    },
  );

  return ClassUser;
};
