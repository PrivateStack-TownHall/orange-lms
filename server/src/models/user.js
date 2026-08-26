"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Profile, {
        foreignKey: "UserId",
        as: "profile",
        onDelete: "CASCADE",
      });

      User.hasMany(models.Class, {
        foreignKey: "MentorId",
        as: "mentoredClasses",
      });

      User.belongsToMany(models.Class, {
        through: {
          model: models.ClassUser,
          where: {
            roleInClass: "Mentee",
          },
        },
        foreignKey: "UserId",
        otherKey: "ClassId",
        as: "enrolledClasses",
      });

      User.hasMany(models.ClassUser, {
        foreignKey: "UserId",
      });

      User.hasMany(models.TaskSubmission, {
        foreignKey: "UserId",
      });

      User.hasMany(models.Note, {
        foreignKey: "createdBy",
        as: "createdNotes",
      });

      User.hasMany(models.Task, {
        foreignKey: "createdBy",
        as: "createdTasks",
      });

      User.hasMany(models.Material, {
        foreignKey: "uploadedBy",
        as: "uploadedMaterials",
      });
    }
  }

  User.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      role: DataTypes.STRING,
      avatarUrl: DataTypes.STRING,
      isActive: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "User",
    },
  );

  return User;
};
