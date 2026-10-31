"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    static associate(models) {
      Attendance.belongsTo(models.Meeting, {
        foreignKey: "MeetingId",
      });

      Attendance.belongsTo(models.User, {
        foreignKey: "UserId",
      });

      Attendance.belongsTo(models.User, {
        foreignKey: "checkedBy",
        as: "checker",
      });
    }
  }

  Attendance.init(
    {
      MeetingId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER,
      status: DataTypes.STRING,
      checkedBy: DataTypes.INTEGER,
      checkInAt: DataTypes.DATE,
      notes: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Attendance",
      tableName: "Attendances",
    },
  );

  return Attendance;
};
