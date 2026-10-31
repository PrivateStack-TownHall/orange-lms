"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Note extends Model {
    static associate(models) {
      Note.belongsTo(models.Class, {
        foreignKey: "ClassId",
      });

      Note.belongsTo(models.Meeting, {
        foreignKey: "MeetingId",
      });

      Note.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "creator",
      });
    }
  }

  Note.init(
    {
      ClassId: DataTypes.INTEGER,
      MeetingId: DataTypes.INTEGER,
      createdBy: DataTypes.INTEGER,
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      fileUrl: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Note",
    },
  );

  return Note;
};
