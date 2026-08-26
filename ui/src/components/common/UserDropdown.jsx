import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";

import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { logout } from "@/app/store/slices/authSlice";
import AuthService from "@/services/modules/auth.service";

const ROLE_STYLES = {
  Owner:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",

  Admin:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",

  Mentor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",

  Mentee:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

const UserDropdown = ({ user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await AuthService.logoutRequest();
    dispatch(logout());
    navigate("/auth/login");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-3">
        <span
          className={`rounded-sm px-3 py-1 text-xs font-semibold ${
            ROLE_STYLES[user?.role] || "bg-gray-100 text-gray-700"
          }`}
        >
          {user?.role || "Guest"}
        </span>

        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-sm px-3 py-2 transition hover:bg-gray-100 dark:hover:bg-neutral-800"
        >
          <User size={18} />

          <span className="font-medium">{user?.name || "Guest"}</span>

          <ChevronDown size={16} />
        </button>
      </div>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
          <Link
            to={"/profile"}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-gray-50 dark:hover:bg-neutral-800"
          >
            <User size={16} />
            Profile
          </Link>

          <div className="border-t border-gray-200" />

          <Link
            to={"/settings"}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-gray-50 dark:hover:bg-neutral-800"
          >
            <Settings size={16} />
            Settings
          </Link>

          <div className="border-t border-gray-200" />

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
