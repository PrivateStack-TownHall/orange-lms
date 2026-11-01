"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.renameTable("BlueprintSessions", "BlueprintMeetings");
    await queryInterface.renameColumn("CourseBlueprints", "totalSessions", "totalMeetings");
    await queryInterface.renameColumn("BlueprintMaterials", "BlueprintSessionId", "BlueprintMeetingId");
    await queryInterface.renameColumn("BlueprintTasks", "BlueprintSessionId", "BlueprintMeetingId");
  },

  async down(queryInterface) {
    await queryInterface.renameColumn("BlueprintTasks", "BlueprintMeetingId", "BlueprintSessionId");
    await queryInterface.renameColumn("BlueprintMaterials", "BlueprintMeetingId", "BlueprintSessionId");
    await queryInterface.renameColumn("CourseBlueprints", "totalMeetings", "totalSessions");
    await queryInterface.renameTable("BlueprintMeetings", "BlueprintSessions");
  },
};
