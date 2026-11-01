"use strict";

const BLUEPRINT_CODE = "FS-WEB-FOUNDATIONS";

const findOne = async (queryInterface, sql, replacements, transaction) => {
  const [rows] = await queryInterface.sequelize.query(sql, { replacements, transaction });
  return rows[0];
};

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const owner = await findOne(
        queryInterface,
        `SELECT id FROM "Users" WHERE role IN ('Owner', 'Admin') ORDER BY id ASC LIMIT 1;`,
        {},
        transaction,
      );

      if (!owner) {
        await transaction.commit();
        return;
      }

      const now = new Date();
      let blueprint = await findOne(
        queryInterface,
        `SELECT id FROM "CourseBlueprints" WHERE code = :code LIMIT 1;`,
        { code: BLUEPRINT_CODE },
        transaction,
      );

      if (!blueprint) {
        const [created] = await queryInterface.sequelize.query(
          `INSERT INTO "CourseBlueprints" (code, name, description, category, level, "totalSessions", "durationWeeks", status, "createdBy", "updatedBy", "createdAt", "updatedAt")
           VALUES (:code, :name, :description, :category, :level, 2, 1, 'Published', :userId, :userId, :now, :now)
           RETURNING id;`,
          { replacements: { code: BLUEPRINT_CODE, name: "Full Stack Web Foundations", description: "A reusable two-session web development curriculum.", category: "Web Development", level: "Beginner", userId: owner.id, now }, transaction },
        );
        blueprint = created[0];
      }

      const sessions = [
        { sequence: 1, title: "HTML Foundations", description: "Semantic structure and accessible page content." },
        { sequence: 2, title: "CSS Foundations", description: "Layouts, responsive styling, and reusable components." },
      ];

      for (const sessionData of sessions) {
        const existing = await findOne(
          queryInterface,
          `SELECT id FROM "BlueprintSessions" WHERE "CourseBlueprintId" = :blueprintId AND sequence = :sequence LIMIT 1;`,
          { blueprintId: blueprint.id, sequence: sessionData.sequence },
          transaction,
        );

        if (!existing) {
          await queryInterface.bulkInsert("BlueprintSessions", [{
            CourseBlueprintId: blueprint.id,
            ...sessionData,
            durationMinutes: 120,
            learningObjectives: "Build practical web development foundations.",
            createdAt: now,
            updatedAt: now,
          }], { transaction });
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const blueprint = await findOne(queryInterface, `SELECT id FROM "CourseBlueprints" WHERE code = :code LIMIT 1;`, { code: BLUEPRINT_CODE }, transaction);
      if (blueprint) await queryInterface.bulkDelete("CourseBlueprints", { id: blueprint.id }, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
