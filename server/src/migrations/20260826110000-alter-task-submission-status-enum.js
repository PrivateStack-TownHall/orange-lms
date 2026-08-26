"use strict";

/**
 * The grading flow (assessmentResult.service.js) now transitions a
 * submission through "Under Review" (draft save) and "Graded" (published),
 * matching the Submission Detail UI's timeline states. The original enum
 * only had Submitted/Late/Reviewed/Resubmitted, so this adds the two
 * missing values.
 *
 * Note: ALTER TYPE ... ADD VALUE cannot run inside an explicit transaction
 * block in Postgres, so this migration intentionally issues raw queries
 * without wrapping them in queryInterface.sequelize.transaction().
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_TaskSubmissions_status" ADD VALUE IF NOT EXISTS 'Under Review';
    `);

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_TaskSubmissions_status" ADD VALUE IF NOT EXISTS 'Graded';
    `);
  },

  async down() {
    // Postgres doesn't support removing enum values directly.
    // Rolling back would require recreating the type; skipped since this
    // is an additive, non-breaking change.
  },
};
