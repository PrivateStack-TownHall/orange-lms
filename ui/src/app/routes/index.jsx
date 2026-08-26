import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import ProtectedRoute from "./guards/ProtectedRoute";

import MainLayout from "@/layouts/MainLayout";

import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/notfound";

// Route Modules
import authRoutes from "./modules/auth.routes";

import classRoutes from "./modules/class.routes";
import meetingRoutes from "./modules/meeting.routes";
import taskRoutes from "./modules/task.routes";
import noteRoutes from "./modules/note.routes";
import materialRoutes from "./modules/material.routes";

import mentorRoutes from "./modules/mentor.routes";
import menteeRoutes from "./modules/mentee.routes";

import attendanceRoutes from "./modules/attendance.routes";
import historyClassRoutes from "./modules/historyClass.routes";

import taskCriteriaRoutes from "./modules/taskCriteria.routes";
import assessmentRoutes from "./modules/assessment.routes.jsx";

import profileRoutes from "./modules/profile.routes";
import settingRoutes from "./modules/setting.routes";
import adminRoutes from "./modules/admin.routes.jsx";

// V4 - Notifications, Logs & Reports
import notificationRoutes from "./modules/notification.routes";
import auditLogRoutes from "./modules/auditLog.routes";
import userActivityRoutes from "./modules/userActivity.routes";
import reportsRoutes from "./modules/reports.routes";

const router = createBrowserRouter([
  authRoutes,
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },

      {
        path: "dashboard",
        element: <Dashboard />,
      },
      // V1
      classRoutes,
      meetingRoutes,
      taskRoutes,
      noteRoutes,
      materialRoutes,
      adminRoutes,
      mentorRoutes,
      menteeRoutes,
      // V3
      attendanceRoutes,
      historyClassRoutes,
      taskCriteriaRoutes,
      assessmentRoutes,
      // Profile
      profileRoutes,
      // Setting
      settingRoutes,
      // V4
      notificationRoutes,
      auditLogRoutes,
      userActivityRoutes,
      reportsRoutes,
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
