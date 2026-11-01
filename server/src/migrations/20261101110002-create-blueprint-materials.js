"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("BlueprintMaterials", {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      BlueprintSessionId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "BlueprintSessions", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      type: { type: Sequelize.STRING },
      fileUrl: { type: Sequelize.STRING },
      sortOrder: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("BlueprintMaterials");
  },
};
