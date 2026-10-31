"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      Task.belongsTo(models.Class, {
        foreignKey: "ClassId",
      });

      Task.belongsTo(models.Meeting, {
        foreignKey: "MeetingId",
      });

      Task.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "creator",
      });

      Task.hasMany(models.TaskSubmission, {
        foreignKey: "TaskId",
        onDelete: "CASCADE",
      });

      Task.hasMany(models.TaskCriteria, {
        foreignKey: "TaskId",
        onDelete: "CASCADE",
      });
    }
  }

  Task.init(
    {
      ClassId: DataTypes.INTEGER,
      MeetingId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      createdBy: DataTypes.INTEGER,
      dueDate: DataTypes.DATE,
      maxScore: DataTypes.INTEGER,
      status: DataTypes.STRING,
      fileUrl: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Task",
    },
  );

  return Task;
};
