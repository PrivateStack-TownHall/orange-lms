"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BlueprintMeeting extends Model {
    static associate(models) {
      BlueprintMeeting.belongsTo(models.CourseBlueprint, { foreignKey: "CourseBlueprintId", as: "blueprint" });
      BlueprintMeeting.hasMany(models.BlueprintMaterial, { foreignKey: "BlueprintMeetingId", as: "materials", onDelete: "CASCADE" });
      BlueprintMeeting.hasMany(models.BlueprintTask, { foreignKey: "BlueprintMeetingId", as: "tasks", onDelete: "CASCADE" });
    }
  }

  BlueprintMeeting.init({
    CourseBlueprintId: DataTypes.INTEGER,
    sequence: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    learningObjectives: DataTypes.TEXT,
    durationMinutes: DataTypes.INTEGER,
  }, { sequelize, modelName: "BlueprintMeeting" });

  return BlueprintMeeting;
};
