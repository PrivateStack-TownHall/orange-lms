"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BlueprintMaterial extends Model {
    static associate(models) {
      BlueprintMaterial.belongsTo(models.BlueprintMeeting, { foreignKey: "BlueprintMeetingId", as: "meeting" });
    }
  }

  BlueprintMaterial.init({
    BlueprintMeetingId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    type: DataTypes.STRING,
    fileUrl: DataTypes.STRING,
    sortOrder: DataTypes.INTEGER,
  }, { sequelize, modelName: "BlueprintMaterial" });

  return BlueprintMaterial;
};
