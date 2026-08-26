"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserActivities", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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

      activity: {
        // e.g. "Submitted Task", "Viewed Material", "Joined Meeting",
        // "Downloaded File", "Completed Task", "Graded Submission",
        // "Created Note", "Updated Profile", "Logged In", "Logged Out"
        type: Sequelize.STRING,
        allowNull: false,
      },

      description: {
        type: Sequelize.STRING,
      },

      ClassId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Classes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      resourceType: {
        // Task | Material | Note | Meeting | Attendance | AssessmentResult | Auth | Profile
        type: Sequelize.STRING,
      },

      resourceId: {
        type: Sequelize.INTEGER,
      },

      device: {
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

    await queryInterface.addIndex("UserActivities", ["UserId"]);
    await queryInterface.addIndex("UserActivities", ["activity"]);
    await queryInterface.addIndex("UserActivities", ["createdAt"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("UserActivities");
  },
};
