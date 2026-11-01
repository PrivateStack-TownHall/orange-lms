"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Class extends Model {
    static associate(models) {
      Class.belongsTo(models.User, {
        foreignKey: "MentorId",
        as: "mentor",
      });

      Class.belongsTo(models.CourseBlueprint, {
        foreignKey: "CourseBlueprintId",
        as: "blueprint",
      });

      Class.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "creator",
      });

      Class.belongsToMany(models.User, {
        through: {
          model: models.ClassUser,
          where: {
            roleInClass: "Mentee",
          },
        },
        foreignKey: "ClassId",
        otherKey: "UserId",
        as: "mentees",
      });

      Class.belongsToMany(models.User, {
        through: {
          model: models.ClassUser,
          where: {
            roleInClass: "Reviewer",
          },
        },
        foreignKey: "ClassId",
        otherKey: "UserId",
        as: "reviewers",
      });

      Class.hasMany(models.ClassUser, {
        foreignKey: "ClassId",
      });

      Class.hasMany(models.Meeting, {
        foreignKey: "ClassId",
        as: "meetings",
        onDelete: "CASCADE",
      });

      Class.hasMany(models.MentorSubstitution, {
        foreignKey: "ClassId",
        as: "mentorSubstitutions",
        onDelete: "CASCADE",
      });

      Class.hasMany(models.Note, {
        foreignKey: "ClassId",
        as: "notes",
        onDelete: "CASCADE",
      });

      Class.hasMany(models.Task, {
        foreignKey: "ClassId",
        as: "tasks",
        onDelete: "CASCADE",
      });

      Class.hasMany(models.Material, {
        foreignKey: "ClassId",
        as: "materials",
        onDelete: "CASCADE",
      });
    }
  }

  Class.init(
    {
      code: DataTypes.STRING,
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      category: DataTypes.STRING,
      MentorId: DataTypes.INTEGER,
      createdBy: DataTypes.INTEGER,
      level: DataTypes.STRING,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      status: DataTypes.STRING,
      imageUrl: DataTypes.STRING,
      CourseBlueprintId: DataTypes.INTEGER,
      deliveryMode: DataTypes.STRING,
      location: DataTypes.STRING,
      meetingUrl: DataTypes.STRING,
      scheduleDays: DataTypes.JSON,
      startHour: DataTypes.TIME,
      finishHour: DataTypes.TIME,
    },
    {
      sequelize,
      modelName: "Class",
    },
  );

  return Class;
};
