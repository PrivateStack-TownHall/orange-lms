const ROLES = require("../constants/roles");

module.exports = {
  user: {
    read: [ROLES.OWNER, ROLES.ADMIN],
    create: [ROLES.OWNER, ROLES.ADMIN],
    update: [ROLES.OWNER, ROLES.ADMIN],
    delete: [ROLES.OWNER, ROLES.ADMIN],
  },

  mentor: {
    read: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR],
    create: [ROLES.OWNER, ROLES.ADMIN],
    update: [ROLES.OWNER, ROLES.ADMIN],
    delete: [ROLES.OWNER, ROLES.ADMIN],
  },

  mentee: {
    read: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR],
    create: [ROLES.OWNER, ROLES.ADMIN],
    update: [ROLES.OWNER, ROLES.ADMIN],
    delete: [ROLES.OWNER, ROLES.ADMIN],
  },

  class: {
    read: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR, ROLES.MENTEE],
    create: [ROLES.OWNER, ROLES.ADMIN],
    update: [ROLES.OWNER, ROLES.ADMIN],
    delete: [ROLES.OWNER, ROLES.ADMIN],
  },

  meeting: {
    read: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR, ROLES.MENTEE],
    create: [ROLES.OWNER, ROLES.ADMIN],
    update: [ROLES.OWNER, ROLES.ADMIN],
    delete: [ROLES.OWNER, ROLES.ADMIN],
  },

  task: {
    read: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR, ROLES.MENTEE],
    create: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR],
    update: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR],
    delete: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR],
    submit: [ROLES.MENTEE],
  },

  note: {
    read: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR, ROLES.MENTEE],
    create: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR],
    update: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR],
    delete: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR],
  },

  material: {
    read: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR, ROLES.MENTEE],
    create: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR],
    update: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR],
    delete: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR],
  },

  // Tambahan table baru
  attendance: {
    read: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR, ROLES.MENTEE],
    create: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR],
    update: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR],
    delete: [ROLES.OWNER, ROLES.ADMIN],
  },

  taskCriteria: {
    read: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR, ROLES.MENTEE],
    create: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR],
    update: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR],
    delete: [ROLES.OWNER, ROLES.ADMIN],
  },

  assessmentResult: {
    read: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR, ROLES.MENTEE],
    create: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR],
    update: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR],
    delete: [ROLES.OWNER, ROLES.ADMIN],
  },

  score: {
    read: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR, ROLES.MENTEE],
    create: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR],
    update: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR],
    delete: [ROLES.OWNER, ROLES.ADMIN],
  },

  historyClass: {
    read: [ROLES.OWNER, ROLES.ADMIN],
    create: [ROLES.OWNER, ROLES.ADMIN],
    update: [ROLES.OWNER, ROLES.ADMIN],
    delete: [ROLES.OWNER],
  },

  // Tambahan V4
  notification: {
    // Every role reads/manages only their own notifications (enforced in service)
    read: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR, ROLES.MENTEE],
    update: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR, ROLES.MENTEE],
    delete: [ROLES.OWNER, ROLES.ADMIN, ROLES.MENTOR, ROLES.MENTEE],
  },

  auditLog: {
    read: [ROLES.OWNER, ROLES.ADMIN],
  },

  userActivity: {
    read: [ROLES.OWNER, ROLES.ADMIN],
  },

  reports: {
    read: [ROLES.OWNER],
  },
};
