"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AuditLog extends Model {
    static associate(models) {
      AuditLog.belongsTo(models.User, {
        foreignKey: "UserId",
      });
    }
  }

  AuditLog.init(
    {
      UserId: DataTypes.INTEGER,
      role: DataTypes.STRING,
      action: DataTypes.STRING,
      resource: DataTypes.STRING,
      resourceId: DataTypes.INTEGER,
      resourceDetail: DataTypes.STRING,
      ipAddress: DataTypes.STRING,
      device: DataTypes.STRING,
      metadata: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "AuditLog",
      tableName: "AuditLogs",
    },
  );

  return AuditLog;
};
