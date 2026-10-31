import React from "react";
import { Navigate } from "react-router-dom";

import PublicRoute from "../guards/PublicRoute";

import AuthLayout from "@/layouts/AuthLayout";

import Login from "@/pages/auth/Login";

const authRoutes = {
  path: "/auth",

  element: (
    <PublicRoute>
      <AuthLayout />
    </PublicRoute>
  ),

  children: [
    {
      path: "login",
      element: <Login />,
    },
    {
      index: true,
      element: <Navigate to="login" replace />,
    },
  ],
};

export default authRoutes;
