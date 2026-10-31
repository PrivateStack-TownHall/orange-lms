"use strict";

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const readData = (fileName) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, "data", fileName), "utf-8"));

const activities = readData("activities.json");

const data = {
  users: readData("users.json").users,
  profiles: readData("profiles.json").profiles,

  classes: readData("classes.json").classes,
  classUsers: readData("classes.json").classUsers,

  ...readData("learning.json"),
  ...activities,
};

// PostgreSQL JSON/JSONB column needs the object
// to be serialized before bulkInsert.
data.auditLogs = data.auditLogs.map((auditLog) => ({
  ...auditLog,
  metadata: JSON.stringify(auditLog.metadata),
}));

const tables = [
  "Users",
  "Profiles",
  "Classes",
  "ClassUsers",
  "Meetings",
  "Notes",
  "Tasks",
  "Materials",
  "TaskSubmissions",
  "Attendances",
  "TaskCriterias",
  "AssessmentResults",
  "SubmissionCriteriaScores",
  "HistoryClasses",
  "Notifications",
  "UserActivities",
  "AuditLogs",
];

const insert = async (queryInterface, table, rows, transaction) => {
  if (!rows.length) return;

  await queryInterface.bulkInsert(table, rows, {
    transaction,
  });
};

const syncSequences = async (queryInterface, transaction) => {
  for (const table of tables) {
    await queryInterface.sequelize.query(
      `SELECT setval(
        pg_get_serial_sequence('"${table}"', 'id'),
        COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1,
        false
      );`,
      {
        transaction,
      },
    );
  }
};

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const now = new Date();

      const users = data.users.map((user) => ({
        ...user,
        password: bcrypt.hashSync(user.password, 10),
        createdAt: user.createdAt || now,
        updatedAt: user.updatedAt || now,
      }));

      // Core
      await insert(queryInterface, "Users", users, transaction);
      await insert(queryInterface, "Profiles", data.profiles, transaction);

      // Classes
      await insert(queryInterface, "Classes", data.classes, transaction);
      await insert(queryInterface, "ClassUsers", data.classUsers, transaction);

      // Learning
      await insert(queryInterface, "Meetings", data.meetings, transaction);

      await insert(queryInterface, "Notes", data.notes, transaction);

      await insert(queryInterface, "Tasks", data.tasks, transaction);

      await insert(queryInterface, "Materials", data.materials, transaction);

      await insert(
        queryInterface,
        "TaskSubmissions",
        data.taskSubmissions,
        transaction,
      );

      await insert(
        queryInterface,
        "Attendances",
        data.attendances,
        transaction,
      );

      await insert(
        queryInterface,
        "TaskCriterias",
        data.taskCriterias,
        transaction,
      );

      await insert(
        queryInterface,
        "AssessmentResults",
        data.assessmentResults,
        transaction,
      );

      await insert(
        queryInterface,
        "SubmissionCriteriaScores",
        data.submissionCriteriaScores,
        transaction,
      );

      // Activities
      await insert(
        queryInterface,
        "HistoryClasses",
        data.historyClasses,
        transaction,
      );

      await insert(
        queryInterface,
        "Notifications",
        data.notifications,
        transaction,
      );

      await insert(
        queryInterface,
        "UserActivities",
        data.userActivities,
        transaction,
      );

      await insert(queryInterface, "AuditLogs", data.auditLogs, transaction);

      // JSON seed data uses explicit IDs so all foreign-key
      // relationships remain deterministic.
      //
      // After inserting explicit IDs, synchronize PostgreSQL
      // sequences so the next API-created record gets
      // MAX(id) + 1 instead of starting from an old sequence value.
      await syncSequences(queryInterface, transaction);

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Delete in reverse dependency order.
      await queryInterface.bulkDelete("AuditLogs", null, { transaction });

      await queryInterface.bulkDelete("UserActivities", null, { transaction });

      await queryInterface.bulkDelete("Notifications", null, { transaction });

      await queryInterface.bulkDelete("HistoryClasses", null, { transaction });

      await queryInterface.bulkDelete("SubmissionCriteriaScores", null, {
        transaction,
      });

      await queryInterface.bulkDelete("AssessmentResults", null, {
        transaction,
      });

      await queryInterface.bulkDelete("TaskCriterias", null, { transaction });

      await queryInterface.bulkDelete("Attendances", null, { transaction });

      await queryInterface.bulkDelete("TaskSubmissions", null, { transaction });

      await queryInterface.bulkDelete("Materials", null, { transaction });

      await queryInterface.bulkDelete("Tasks", null, { transaction });

      await queryInterface.bulkDelete("Notes", null, { transaction });

      await queryInterface.bulkDelete("Meetings", null, { transaction });

      await queryInterface.bulkDelete("ClassUsers", null, { transaction });

      await queryInterface.bulkDelete("Classes", null, { transaction });

      await queryInterface.bulkDelete("Profiles", null, { transaction });

      await queryInterface.bulkDelete("Users", null, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
