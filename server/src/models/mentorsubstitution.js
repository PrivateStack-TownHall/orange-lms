"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MentorSubstitution extends Model {
    static associate(models) {
      MentorSubstitution.belongsTo(models.Class, {
        foreignKey: "ClassId",
        as: "class",
      });

      MentorSubstitution.belongsTo(models.Meeting, {
        foreignKey: "MeetingId",
        as: "meeting",
      });

      MentorSubstitution.belongsTo(models.User, {
        foreignKey: "MentorId",
        as: "mentor",
      });

      MentorSubstitution.belongsTo(models.User, {
        foreignKey: "assignedBy",
        as: "assigner",
      });
    }
  }

  MentorSubstitution.init(
    {
      ClassId: DataTypes.INTEGER,
      MeetingId: DataTypes.INTEGER,
      MentorId: DataTypes.INTEGER,
      assignedBy: DataTypes.INTEGER,
      reason: DataTypes.TEXT,
      startAt: DataTypes.DATE,
      endAt: DataTypes.DATE,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "MentorSubstitution",
    },
  );

  return MentorSubstitution;
};
