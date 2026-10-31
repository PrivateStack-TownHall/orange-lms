"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("TaskSubmissions", "submissionFileUrl", {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn("TaskSubmissions", "feedback", {
      type: Sequelize.TEXT,
    });

    await queryInterface.addColumn("TaskSubmissions", "score", {
      type: Sequelize.INTEGER,
    });

    await queryInterface.addColumn("TaskSubmissions", "reviewedAt", {
      type: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("TaskSubmissions", "submissionFileUrl");

    await queryInterface.removeColumn("TaskSubmissions", "feedback");

    await queryInterface.removeColumn("TaskSubmissions", "score");

    await queryInterface.removeColumn("TaskSubmissions", "reviewedAt");
  },
};
