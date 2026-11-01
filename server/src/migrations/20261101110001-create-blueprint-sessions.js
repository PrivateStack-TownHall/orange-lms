"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("BlueprintSessions", {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      CourseBlueprintId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "CourseBlueprints", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      sequence: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      learningObjectives: { type: Sequelize.TEXT },
      durationMinutes: { type: Sequelize.INTEGER },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.addIndex("BlueprintSessions", ["CourseBlueprintId", "sequence"], {
      unique: true,
      name: "blueprint_sessions_course_sequence_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("BlueprintSessions");
  },
};
