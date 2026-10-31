"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Meeting extends Model {
    static associate(models) {
      Meeting.belongsTo(models.Class, {
        foreignKey: "ClassId",
        as: "class",
      });

      Meeting.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "creator",
      });

      Meeting.hasMany(models.Task, {
        foreignKey: "MeetingId",
        as: "tasks",
        onDelete: "CASCADE",
      });

      Meeting.hasMany(models.Note, {
        foreignKey: "MeetingId",
        as: "notes",
        onDelete: "CASCADE",
      });

      Meeting.hasMany(models.Material, {
        foreignKey: "MeetingId",
        as: "materials",
        onDelete: "CASCADE",
      });
    }
  }

  Meeting.init(
    {
      ClassId: DataTypes.INTEGER,
      meetingNumber: DataTypes.INTEGER,
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      meetingDate: DataTypes.DATE,
      startHour: DataTypes.TIME,
      finishHour: DataTypes.TIME,
      imageUrl: DataTypes.STRING,
      createdBy: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Meeting",
    },
  );

  return Meeting;
};
