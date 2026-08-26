"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, {
        foreignKey: "UserId",
      });

      Notification.belongsTo(models.Class, {
        foreignKey: "ClassId",
        as: "class",
      });
    }
  }

  Notification.init(
    {
      UserId: DataTypes.INTEGER,
      type: DataTypes.STRING,
      title: DataTypes.STRING,
      message: DataTypes.TEXT,
      isRead: DataTypes.BOOLEAN,
      relatedType: DataTypes.STRING,
      relatedId: DataTypes.INTEGER,
      ClassId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Notification",
      tableName: "Notifications",
    },
  );

  return Notification;
};
