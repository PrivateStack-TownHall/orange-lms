const UI_PERMISSIONS = {
  Owner: {
    dashboard: ["read"],

    admin: ["read", "create", "update", "delete"],
    mentor: ["read", "create", "update", "delete"],
    mentee: ["read", "create", "update", "delete"],

    class: ["read", "create", "update", "delete"],
    meeting: ["read", "create", "update", "delete"],

    task: ["read", "create", "update", "delete"],
    note: ["read", "create", "update", "delete"],
    material: ["read", "create", "update", "delete"],

    attendance: ["read", "create", "update", "delete"],
    taskCriteria: ["read", "create", "update", "delete"],
    score: ["read", "create", "update", "delete"],

    historyClass: ["read", "create", "update", "delete"],

    notification: ["read", "update", "delete"],
    auditLog: ["read"],
    userActivity: ["read"],
    reports: ["read"],

    profile: ["read", "update"],
    setting: ["read", "update"],
  },

  Admin: {
    dashboard: ["read"],

    mentor: ["read", "create", "update"],
    mentee: ["read", "create", "update"],

    class: ["read", "create", "update", "delete"],
    meeting: ["read", "create", "update", "delete"],

    task: ["read", "create", "update", "delete"],
    note: ["read", "create", "update", "delete"],
    material: ["read", "create", "update", "delete"],

    attendance: ["read", "create", "update", "delete"],
    taskCriteria: ["read", "create", "update", "delete"],
    score: ["read", "create", "update", "delete"],

    historyClass: ["read", "create", "update"],

    notification: ["read", "update", "delete"],
    auditLog: ["read"],
    userActivity: ["read"],
    // Reports is intentionally Owner-only — Admin does NOT get this.

    profile: ["read", "update"],
    setting: ["read", "update"],
  },

  Mentor: {
    dashboard: ["read"],

    mentee: ["read"],

    class: ["read"],
    meeting: ["read"],

    task: ["read", "create", "update", "delete"],
    note: ["read", "create", "update", "delete"],
    material: ["read", "create", "update", "delete"],

    attendance: ["read", "create", "update"],
    taskCriteria: ["read", "create", "update"],
    score: ["read", "create", "update"],

    notification: ["read", "update", "delete"],

    profile: ["read", "update"],
    setting: ["read", "update"],
  },

  Mentee: {
    dashboard: ["read"],

    class: ["read"],
    meeting: ["read"],

    task: ["read", "submit"],
    note: ["read"],
    material: ["read"],

    attendance: ["read"],
    taskCriteria: ["read"],
    score: ["read"],

    notification: ["read", "update", "delete"],

    profile: ["read", "update"],
    setting: ["read", "update"],
  },
};

export default UI_PERMISSIONS;
