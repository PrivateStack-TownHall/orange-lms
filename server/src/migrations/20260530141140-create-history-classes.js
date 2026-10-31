"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("HistoryClasses", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      ClassId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Classes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      roleInClass: {
        type: Sequelize.ENUM("Mentor", "Mentee"),
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("Completed", "Failed", "Dropped", "Archived"),
        defaultValue: "Completed",
      },

      finalScore: {
        type: Sequelize.DECIMAL(5, 2),
      },

      attendancePercentage: {
        type: Sequelize.DECIMAL(5, 2),
      },

      completedAt: {
        type: Sequelize.DATE,
      },

      remarks: {
        type: Sequelize.TEXT,
      },

      certificateUrl: {
        type: Sequelize.STRING,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("HistoryClasses");
  },
};
