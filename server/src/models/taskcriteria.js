"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class TaskCriteria extends Model {
    static associate(models) {
      TaskCriteria.belongsTo(models.Task, {
        foreignKey: "TaskId",
      });

      TaskCriteria.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "creator",
      });

      TaskCriteria.hasMany(models.SubmissionCriteriaScore, {
        foreignKey: "TaskCriteriaId",
        onDelete: "CASCADE",
      });
    }
  }

  TaskCriteria.init(
    {
      TaskId: DataTypes.INTEGER,
      title: DataTypes.STRING,
      percentage: DataTypes.DECIMAL(5, 2),
      description: DataTypes.TEXT,
      createdBy: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "TaskCriteria",
      tableName: "TaskCriterias",
    },
  );

  return TaskCriteria;
};
