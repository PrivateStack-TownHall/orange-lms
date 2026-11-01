"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BlueprintTask extends Model {
    static associate(models) {
      BlueprintTask.belongsTo(models.BlueprintMeeting, { foreignKey: "BlueprintMeetingId", as: "meeting" });
    }
  }

  BlueprintTask.init({
    BlueprintMeetingId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    dueOffsetDays: DataTypes.INTEGER,
    maxScore: DataTypes.INTEGER,
    status: DataTypes.STRING,
    fileUrl: DataTypes.STRING,
    sortOrder: DataTypes.INTEGER,
  }, { sequelize, modelName: "BlueprintTask" });

  return BlueprintTask;
};
