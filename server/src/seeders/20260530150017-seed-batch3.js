"use strict";

const fs = require("fs");
const path = require("path");

const batch4 = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "batch4.json"), "utf-8"),
);
const batch5 = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "batch5.json"), "utf-8"),
);

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    /**
     * ATTENDANCES
     */
    const attendances = batch5.attendances.map((attendance) => ({
      ...attendance,
      createdAt: now,
      updatedAt: now,
    }));

    await queryInterface.bulkInsert("Attendances", attendances, {});

    /**
     * TASK CRITERIAS
     */
    const taskCriteria = batch4.taskCriterias.map((criteria) => ({
      ...criteria,
      createdAt: now,
      updatedAt: now,
    }));

    await queryInterface.bulkInsert("TaskCriterias", taskCriteria, {});

    /**
     * ASSESSMENT RESULTS
     */
    const assessmentResults = batch4.assessmentResults.map((result) => ({
      ...result,
      createdAt: now,
      updatedAt: now,
    }));

    await queryInterface.bulkInsert("AssessmentResults", assessmentResults, {});

    /**
     * SUBMISSION CRITERIA SCORES
     */
    const submissionCriteriaScores = batch4.submissionCriteriaScores.map(
      (score) => ({
        ...score,
        createdAt: now,
        updatedAt: now,
      }),
    );

    await queryInterface.bulkInsert(
      "SubmissionCriteriaScores",
      submissionCriteriaScores,
      {},
    );

    /**
     * HISTORY CLASSES
     */
    const historyClasses = batch5.historyClasses.map((history) => ({
      ...history,
      createdAt: now,
      updatedAt: now,
    }));

    await queryInterface.bulkInsert("HistoryClasses", historyClasses, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("HistoryClasses", null, {});
    await queryInterface.bulkDelete("SubmissionCriteriaScores", null, {});
    await queryInterface.bulkDelete("AssessmentResults", null, {});
    await queryInterface.bulkDelete("TaskCriterias", null, {});
    await queryInterface.bulkDelete("Attendances", null, {});
  },
};
