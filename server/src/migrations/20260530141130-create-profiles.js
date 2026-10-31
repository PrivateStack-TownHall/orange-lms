"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Profiles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      age: {
        type: Sequelize.INTEGER,
      },

      gender: {
        type: Sequelize.STRING,
      },

      address: {
        type: Sequelize.STRING,
      },

      city: {
        type: Sequelize.STRING,
      },

      country: {
        type: Sequelize.STRING,
      },

      background: {
        type: Sequelize.TEXT,
      },

      phoneNumber: {
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
    await queryInterface.dropTable("Profiles");
  },
};
