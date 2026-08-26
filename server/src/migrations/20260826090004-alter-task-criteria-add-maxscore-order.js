"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("TaskCriterias", "maxScore", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 100,
    });

    await queryInterface.addColumn("TaskCriterias", "order", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("TaskCriterias", "maxScore");
    await queryInterface.removeColumn("TaskCriterias", "order");
  },
};
