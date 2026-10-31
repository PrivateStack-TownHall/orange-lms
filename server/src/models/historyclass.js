"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class HistoryClass extends Model {
    static associate(models) {
      HistoryClass.belongsTo(models.Class, {
        foreignKey: "ClassId",
      });

      HistoryClass.belongsTo(models.User, {
        foreignKey: "UserId",
      });
    }
  }

  HistoryClass.init(
    {
      ClassId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER,
      roleInClass: DataTypes.STRING,
      status: DataTypes.STRING,
      finalScore: DataTypes.DECIMAL,
      attendancePercentage: DataTypes.DECIMAL,
      completedAt: DataTypes.DATE,
      remarks: DataTypes.TEXT,
      certificateUrl: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "HistoryClass",
      tableName: "HistoryClasses",
    },
  );

  return HistoryClass;
};
