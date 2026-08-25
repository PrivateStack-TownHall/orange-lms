"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AssessmentResult extends Model {
    static associate(models) {
      AssessmentResult.belongsTo(models.TaskSubmission, {
        foreignKey: "TaskSubmissionId",
      });

      AssessmentResult.belongsTo(models.User, {
        foreignKey: "gradedBy",
        as: "grader",
      });

      AssessmentResult.hasMany(models.SubmissionCriteriaScore, {
        foreignKey: "AssessmentResultId",
        as: "scores",

        onDelete: "CASCADE",
      });
    }
  }

  AssessmentResult.init(
    {
      TaskSubmissionId: DataTypes.INTEGER,
      gradedBy: DataTypes.INTEGER,
      finalScore: DataTypes.DECIMAL(5, 2),
      mentorFeedback: DataTypes.TEXT,
      gradedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "AssessmentResult",
      tableName: "AssessmentResults",
    },
  );

  return AssessmentResult;
};
