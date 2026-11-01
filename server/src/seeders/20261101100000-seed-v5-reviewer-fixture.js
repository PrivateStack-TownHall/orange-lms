"use strict";

const bcrypt = require("bcrypt");

const REVIEWER_EMAIL = "reviewer@orange-lms.test";

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const now = new Date();
      const [existingReviewers] = await queryInterface.sequelize.query(
        `SELECT id FROM "Users" WHERE email = :email LIMIT 1;`,
        { replacements: { email: REVIEWER_EMAIL }, transaction },
      );

      let reviewerId = existingReviewers[0]?.id;

      if (!reviewerId) {
        const [createdReviewers] = await queryInterface.sequelize.query(
          `INSERT INTO "Users" (name, email, password, role, "isActive", "createdAt", "updatedAt")
           VALUES (:name, :email, :password, :role, true, :now, :now)
           RETURNING id;`,
          {
            replacements: {
              name: "V5 Reviewer",
              email: REVIEWER_EMAIL,
              password: bcrypt.hashSync("Reviewer123!", 10),
              role: "Reviewer",
              now,
            },
            transaction,
          },
        );
        reviewerId = createdReviewers[0].id;

        await queryInterface.bulkInsert("Profiles", [{
          UserId: reviewerId,
          city: "Jakarta",
          country: "Indonesia",
          createdAt: now,
          updatedAt: now,
        }], { transaction });
      }

      const [classes] = await queryInterface.sequelize.query(
        `SELECT id FROM "Classes" ORDER BY id ASC LIMIT 1;`,
        { transaction },
      );

      if (classes[0]) {
        const [assignments] = await queryInterface.sequelize.query(
          `SELECT id FROM "ClassUsers"
           WHERE "ClassId" = :ClassId AND "UserId" = :UserId AND "roleInClass" = 'Reviewer'
           LIMIT 1;`,
          { replacements: { ClassId: classes[0].id, UserId: reviewerId }, transaction },
        );

        if (!assignments[0]) {
          await queryInterface.bulkInsert("ClassUsers", [{
            ClassId: classes[0].id,
            UserId: reviewerId,
            roleInClass: "Reviewer",
            progressPercentage: 0,
            status: "Active",
            assignedBy: null,
            joinedAt: now,
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
      const [reviewers] = await queryInterface.sequelize.query(
        `SELECT id FROM "Users" WHERE email = :email LIMIT 1;`,
        { replacements: { email: REVIEWER_EMAIL }, transaction },
      );

      if (reviewers[0]) {
        const reviewerId = reviewers[0].id;
        await queryInterface.bulkDelete("ClassUsers", { UserId: reviewerId, roleInClass: "Reviewer" }, { transaction });
        await queryInterface.bulkDelete("Profiles", { UserId: reviewerId }, { transaction });
        await queryInterface.bulkDelete("Users", { id: reviewerId }, { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
