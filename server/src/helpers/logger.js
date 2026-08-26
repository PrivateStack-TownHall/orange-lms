/**
 * Centralized logger for Audit Log, User Activity, and Notifications.
 *
 * Called directly from the service layer (not Sequelize hooks) because
 * services already receive `currentUser`, which hooks don't have access to.
 * Every logging call is fire-and-forget + wrapped in try/catch so that a
 * logging failure never breaks the actual business operation it's attached to.
 */

const detectDevice = (userAgent) => {
  if (!userAgent) return null;

  return /mobile|android|iphone/i.test(userAgent) ? "Mobile" : "Desktop";
};

/**
 * `meta` is optional and comes from the controller: { ip, userAgent }
 * Pass it through when you have access to `req`; omit it for internal/system
 * calls (e.g. cascading logic inside a service).
 */
const logAudit = async ({
  user,
  action,
  resource,
  resourceId,
  resourceDetail,
  meta = {},
  metadata,
}) => {
  try {
    const { AuditLog } = require("../models");

    await AuditLog.create({
      UserId: user?.id || null,
      role: user?.role || "System",
      action,
      resource,
      resourceId: resourceId || null,
      resourceDetail: resourceDetail || null,
      ipAddress: meta.ip || null,
      device: detectDevice(meta.userAgent),
      metadata: metadata || null,
    });
  } catch (err) {
    console.error("[AuditLog] failed:", err.message);
  }
};

const logActivity = async ({
  user,
  activity,
  description,
  ClassId,
  resourceType,
  resourceId,
  meta = {},
}) => {
  try {
    const { UserActivity } = require("../models");

    await UserActivity.create({
      UserId: user?.id,
      activity,
      description: description || null,
      ClassId: ClassId || null,
      resourceType: resourceType || null,
      resourceId: resourceId || null,
      device: detectDevice(meta.userAgent),
    });
  } catch (err) {
    console.error("[UserActivity] failed:", err.message);
  }
};

/**
 * Fan-out a notification to one or many recipients.
 * `userIds` can be a single id or an array of ids.
 */
const notifyUsers = async ({
  userIds,
  type,
  title,
  message,
  relatedType,
  relatedId,
  ClassId,
}) => {
  try {
    const { Notification } = require("../models");

    const ids = Array.isArray(userIds) ? userIds : [userIds];

    const uniqueIds = [...new Set(ids.filter(Boolean))];

    if (uniqueIds.length === 0) return;

    await Notification.bulkCreate(
      uniqueIds.map((UserId) => ({
        UserId,
        type,
        title,
        message,
        isRead: false,
        relatedType: relatedType || null,
        relatedId: relatedId || null,
        ClassId: ClassId || null,
      })),
    );
  } catch (err) {
    console.error("[Notification] failed:", err.message);
  }
};

module.exports = { logAudit, logActivity, notifyUsers, detectDevice };
