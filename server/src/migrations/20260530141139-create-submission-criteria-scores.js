"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("SubmissionCriteriaScores", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      AssessmentResultId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "AssessmentResults",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      TaskCriteriaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "TaskCriterias",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },

      note: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("SubmissionCriteriaScores");
  },
};
