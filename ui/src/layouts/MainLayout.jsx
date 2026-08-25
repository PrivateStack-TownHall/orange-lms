import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

import Sidebar from "../components/common/Sidebar";
import TopBar from "../components/common/TopBar";

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-app text-app transition-all">
      {/* Sidebar */}
      <motion.aside
        initial={{
          x: -40,
          opacity: 0,
        }}
        animate={{
          x: 0,
          opacity: 1,
          width: collapsed ? 80 : "18%",
        }}
        transition={{
          duration: 0.3,
        }}
        className="relative h-screen shrink-0 border-r border-gray-200 bg-[var(--color-surface)] shadow-sm"
      >
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      </motion.aside>

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TopBar */}
        <motion.div
          initial={{
            y: -20,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 0.1,
          }}
        >
          <TopBar />
        </motion.div>

        {/* Content */}
        <motion.main
          key={location.pathname}
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
          }}
          className="flex-1 overflow-auto bg-app p-3 transition-all"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};

export default MainLayout;
