import React from "react";

import logo from "/logo.png";

const AppLogo = ({ collapsed = false }) => {
  return (
    <div className="flex items-center gap-2.5 transition-all duration-300">
      {/* Logo image */}
      <img
        src={logo}
        alt="Orange LMS"
        className={`shrink-0 object-contain transition-all duration-300 ${
          collapsed ? "h-10 w-10" : "h-11 w-11"
        }`}
      />

      {/* Wordmark */}
      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
            ORANGE
          </span>
          <span className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text font-bold text-transparent">
            LMS
          </span>
        </div>
      )}
    </div>
  );
};

export default AppLogo;
