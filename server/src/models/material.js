"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Material extends Model {
    static associate(models) {
      Material.belongsTo(models.Class, {
        foreignKey: "ClassId",
      });

      Material.belongsTo(models.Meeting, {
        foreignKey: "MeetingId",
      });

      Material.belongsTo(models.User, {
        foreignKey: "uploadedBy",
        as: "uploader",
      });
    }
  }

  Material.init(
    {
      ClassId: DataTypes.INTEGER,
      MeetingId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      type: DataTypes.STRING,
      uploadedBy: DataTypes.INTEGER,
      fileUrl: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Material",
    },
  );

  return Material;
};
