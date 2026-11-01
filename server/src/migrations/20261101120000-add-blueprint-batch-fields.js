"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Classes", "CourseBlueprintId", { type: Sequelize.INTEGER, references: { model: "CourseBlueprints", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" });
    await queryInterface.addColumn("Classes", "deliveryMode", { type: Sequelize.STRING });
    await queryInterface.addColumn("Classes", "location", { type: Sequelize.STRING });
    await queryInterface.addColumn("Classes", "meetingUrl", { type: Sequelize.STRING });
    await queryInterface.addColumn("Classes", "scheduleDays", { type: Sequelize.JSONB });
    await queryInterface.addColumn("Classes", "startHour", { type: Sequelize.TIME });
    await queryInterface.addColumn("Classes", "finishHour", { type: Sequelize.TIME });
    await queryInterface.addColumn("Meetings", "BlueprintMeetingId", { type: Sequelize.INTEGER, references: { model: "BlueprintMeetings", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" });
    await queryInterface.addColumn("Meetings", "mode", { type: Sequelize.STRING });
    await queryInterface.addColumn("Meetings", "location", { type: Sequelize.STRING });
    await queryInterface.addColumn("Meetings", "meetingUrl", { type: Sequelize.STRING });
    await queryInterface.addColumn("Tasks", "BlueprintTaskId", { type: Sequelize.INTEGER, references: { model: "BlueprintTasks", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" });
    await queryInterface.addColumn("Materials", "BlueprintMaterialId", { type: Sequelize.INTEGER, references: { model: "BlueprintMaterials", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Materials", "BlueprintMaterialId");
    await queryInterface.removeColumn("Tasks", "BlueprintTaskId");
    await queryInterface.removeColumn("Meetings", "meetingUrl");
    await queryInterface.removeColumn("Meetings", "location");
    await queryInterface.removeColumn("Meetings", "mode");
    await queryInterface.removeColumn("Meetings", "BlueprintMeetingId");
    await queryInterface.removeColumn("Classes", "scheduleDays");
    await queryInterface.removeColumn("Classes", "finishHour");
    await queryInterface.removeColumn("Classes", "startHour");
    await queryInterface.removeColumn("Classes", "meetingUrl");
    await queryInterface.removeColumn("Classes", "location");
    await queryInterface.removeColumn("Classes", "deliveryMode");
    await queryInterface.removeColumn("Classes", "CourseBlueprintId");
  },
};
