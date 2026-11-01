"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("MentorSubstitutions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      ClassId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "Classes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      MeetingId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: { model: "Meetings", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      MentorId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      assignedBy: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      reason: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      startAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      endAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: "Active",
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

    await queryInterface.addIndex("MentorSubstitutions", ["ClassId", "MentorId", "status"]);
    await queryInterface.addIndex("MentorSubstitutions", ["MeetingId", "status"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("MentorSubstitutions");
  },
};
