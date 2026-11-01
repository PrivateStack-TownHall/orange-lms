"use strict";

const FIXTURE_TITLE = "V5 Analytics Fixture";
const FIXTURE_ACTIVITY = "Viewed Analytics Preview";
const FIXTURE_DETAIL = "Seeded V5 analytics preview fixture";

const findFirst = async (queryInterface, table) => {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT id FROM "${table}" ORDER BY id ASC LIMIT 1;`,
  );

  return rows[0];
};

const exists = async (queryInterface, table, column, value) => {
  const [rows] = await queryInterface.sequelize.query(
    `SELECT id FROM "${table}" WHERE "${column}" = :value LIMIT 1;`,
    { replacements: { value } },
  );

  return Boolean(rows[0]);
};

module.exports = {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      const [user, cls] = await Promise.all([
        findFirst(queryInterface, "Users"),
        findFirst(queryInterface, "Classes"),
      ]);

      if (!user || !cls) {
        await transaction.commit();
        return;
      }

      const now = new Date();
      const [activityExists, notificationExists, auditExists] = await Promise.all([
        exists(queryInterface, "UserActivities", "activity", FIXTURE_ACTIVITY),
        exists(queryInterface, "Notifications", "title", FIXTURE_TITLE),
        exists(queryInterface, "AuditLogs", "resourceDetail", FIXTURE_DETAIL),
      ]);

      if (!activityExists) {
        await queryInterface.bulkInsert("UserActivities", [{
          UserId: user.id,
          activity: FIXTURE_ACTIVITY,
          description: "Opened the V5 analytics preview dashboard.",
          ClassId: cls.id,
          resourceType: "Report",
          resourceId: null,
          device: "Web",
          createdAt: now,
          updatedAt: now,
        }], { transaction });
      }

      if (!notificationExists) {
        await queryInterface.bulkInsert("Notifications", [{
          UserId: user.id,
          ClassId: cls.id,
          type: "System",
          title: FIXTURE_TITLE,
          message: "Analytics preview data is available for this class.",
          isRead: false,
          relatedType: "Report",
          relatedId: null,
          createdAt: now,
          updatedAt: now,
        }], { transaction });
      }

      if (!auditExists) {
        await queryInterface.bulkInsert("AuditLogs", [{
          UserId: user.id,
          role: "System",
          action: "CREATE",
          resource: "AnalyticsFixture",
          resourceId: null,
          resourceDetail: FIXTURE_DETAIL,
          ipAddress: null,
          device: "Web",
          metadata: JSON.stringify({ source: "v5-seeder", module: "analytics" }),
          createdAt: now,
          updatedAt: now,
        }], { transaction });
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
      await queryInterface.bulkDelete("AuditLogs", {
        resourceDetail: FIXTURE_DETAIL,
      }, { transaction });
      await queryInterface.bulkDelete("Notifications", {
        title: FIXTURE_TITLE,
      }, { transaction });
      await queryInterface.bulkDelete("UserActivities", {
        activity: FIXTURE_ACTIVITY,
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
