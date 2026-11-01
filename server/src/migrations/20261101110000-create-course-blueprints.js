"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("CourseBlueprints", {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      code: { type: Sequelize.STRING, allowNull: false, unique: true },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      category: { type: Sequelize.STRING },
      level: { type: Sequelize.STRING },
      totalSessions: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      durationWeeks: { type: Sequelize.INTEGER },
      status: { type: Sequelize.ENUM("Draft", "Published", "Archived"), allowNull: false, defaultValue: "Draft" },
      createdBy: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Users", key: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
      updatedBy: { type: Sequelize.INTEGER, references: { model: "Users", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("CourseBlueprints");
  },
};
