"use strict";

const fs = require("fs");
const path = require("path");

const batch2 = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "batch2.json"), "utf-8"),
);
const batch3 = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "batch3.json"), "utf-8"),
);
const batch4 = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "batch4.json"), "utf-8"),
);

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    /**
     * CLASS USERS
     */
    const classUsers = batch2.classUsers.map((item) => ({
      ...item,
      createdAt: now,
      updatedAt: now,
    }));

    await queryInterface.bulkInsert("ClassUsers", classUsers, {});

    /**
     * NOTES
     */
    const notes = batch3.notes.map((note) => ({
      ...note,
      createdAt: now,
      updatedAt: now,
    }));

    await queryInterface.bulkInsert("Notes", notes, {});

    /**
     * TASKS
     */
    const tasks = batch3.tasks.map((task) => ({
      ...task,
      createdAt: now,
      updatedAt: now,
    }));

    await queryInterface.bulkInsert("Tasks", tasks, {});

    /**
     * MATERIALS
     */
    const materials = batch3.materials.map((material) => ({
      ...material,
      createdAt: now,
      updatedAt: now,
    }));

    await queryInterface.bulkInsert("Materials", materials, {});

    /**
     * TASK SUBMISSIONS
     */
    const taskSubmissions = batch4.taskSubmissions.map((submission) => ({
      ...submission,
      createdAt: now,
      updatedAt: now,
    }));

    await queryInterface.bulkInsert("TaskSubmissions", taskSubmissions, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("TaskSubmissions", null, {});
    await queryInterface.bulkDelete("Materials", null, {});
    await queryInterface.bulkDelete("Tasks", null, {});
    await queryInterface.bulkDelete("Notes", null, {});
    await queryInterface.bulkDelete("ClassUsers", null, {});
  },
};
