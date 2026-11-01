"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BlueprintSession extends Model {
    static associate(models) {
      BlueprintSession.belongsTo(models.CourseBlueprint, { foreignKey: "CourseBlueprintId", as: "blueprint" });
      BlueprintSession.hasMany(models.BlueprintMaterial, { foreignKey: "BlueprintSessionId", as: "materials", onDelete: "CASCADE" });
      BlueprintSession.hasMany(models.BlueprintTask, { foreignKey: "BlueprintSessionId", as: "tasks", onDelete: "CASCADE" });
    }
  }

  BlueprintSession.init({
    CourseBlueprintId: DataTypes.INTEGER,
    sequence: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    learningObjectives: DataTypes.TEXT,
    durationMinutes: DataTypes.INTEGER,
  }, { sequelize, modelName: "BlueprintSession" });

  return BlueprintSession;
};
