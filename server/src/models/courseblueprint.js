"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CourseBlueprint extends Model {
    static associate(models) {
      CourseBlueprint.belongsTo(models.User, { foreignKey: "createdBy", as: "creator" });
      CourseBlueprint.belongsTo(models.User, { foreignKey: "updatedBy", as: "updater" });
      CourseBlueprint.hasMany(models.BlueprintMeeting, { foreignKey: "CourseBlueprintId", as: "meetings", onDelete: "CASCADE" });
    }
  }

  CourseBlueprint.init({
    code: DataTypes.STRING,
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    category: DataTypes.STRING,
    level: DataTypes.STRING,
    totalMeetings: DataTypes.INTEGER,
    durationWeeks: DataTypes.INTEGER,
    status: DataTypes.STRING,
    createdBy: DataTypes.INTEGER,
    updatedBy: DataTypes.INTEGER,
  }, { sequelize, modelName: "CourseBlueprint" });

  return CourseBlueprint;
};
