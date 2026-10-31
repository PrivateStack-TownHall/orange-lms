"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserActivity extends Model {
    static associate(models) {
      UserActivity.belongsTo(models.User, {
        foreignKey: "UserId",
      });

      UserActivity.belongsTo(models.Class, {
        foreignKey: "ClassId",
        as: "class",
      });
    }
  }

  UserActivity.init(
    {
      UserId: DataTypes.INTEGER,
      activity: DataTypes.STRING,
      description: DataTypes.STRING,
      ClassId: DataTypes.INTEGER,
      resourceType: DataTypes.STRING,
      resourceId: DataTypes.INTEGER,
      device: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "UserActivity",
      tableName: "UserActivities",
    },
  );

  return UserActivity;
};
