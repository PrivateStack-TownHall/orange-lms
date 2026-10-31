"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SubmissionCriteriaScore extends Model {
    static associate(models) {
      SubmissionCriteriaScore.belongsTo(models.AssessmentResult, {
        foreignKey: "AssessmentResultId",
        as: "assessment",
      });

      SubmissionCriteriaScore.belongsTo(models.TaskCriteria, {
        foreignKey: "TaskCriteriaId",
        as: "criteria",
      });
    }
  }

  SubmissionCriteriaScore.init(
    {
      AssessmentResultId: DataTypes.INTEGER,
      TaskCriteriaId: DataTypes.INTEGER,
      score: DataTypes.DECIMAL(5, 2),
      note: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "SubmissionCriteriaScore",
      tableName: "SubmissionCriteriaScores",
    },
  );

  return SubmissionCriteriaScore;
};
