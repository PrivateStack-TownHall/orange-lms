"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("AuditLogs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      UserId: {
        // nullable: System-generated events (e.g. scheduled jobs) have no user
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      role: {
        // Snapshot of the actor's role at the time of the action
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "System",
      },

      action: {
        // CREATE | UPDATE | DELETE | LOGIN | LOGOUT | ROLE_CHANGE | STATUS_CHANGE
        type: Sequelize.STRING,
        allowNull: false,
      },

      resource: {
        // e.g. "Class", "Task", "User", "Auth"
        type: Sequelize.STRING,
        allowNull: false,
      },

      resourceId: {
        type: Sequelize.INTEGER,
      },

      resourceDetail: {
        // Human readable label, e.g. "JavaScript Basic"
        type: Sequelize.STRING,
      },

      ipAddress: {
        type: Sequelize.STRING,
      },

      device: {
        // Desktop | Mobile
        type: Sequelize.STRING,
      },

      metadata: {
        type: Sequelize.JSON,
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

    await queryInterface.addIndex("AuditLogs", ["resource", "action"]);
    await queryInterface.addIndex("AuditLogs", ["UserId"]);
    await queryInterface.addIndex("AuditLogs", ["createdAt"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("AuditLogs");
  },
};
