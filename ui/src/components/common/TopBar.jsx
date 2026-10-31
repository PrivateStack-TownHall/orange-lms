import React, { useEffect, useRef, useState } from "react";
import {
  Sun,
  Moon,
  ChevronDown,
  PlusCircle,
  BookOpen,
  Calendar,
  CheckSquare,
  FileText,
  Archive,
  UserPlus,
  UserStarIcon,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { useThemeStore } from "@/app/theme";

import { can } from "@/helpers";

import UserDropdown from "./UserDropdown";
import NotificationBell from "./NotificationBell";

const TopBar = () => {
  const { user } = useSelector((state) => state.auth);

  const role = user?.role;

  const { theme, toggleTheme } = useThemeStore();

  const [createOpen, setCreateOpen] = useState(false);

  const createRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (createRef.current && !createRef.current.contains(event.target)) {
        setCreateOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasCreateAccess =
    can(role, "class", "create") ||
    can(role, "meeting", "create") ||
    can(role, "mentor", "create") ||
    can(role, "mentee", "create") ||
    can(role, "task", "create") ||
    can(role, "note", "create") ||
    can(role, "material", "create");

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 transition-colors">
      {/* Left */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600 transition-all hover:scale-105 dark:border-neutral-700 dark:bg-neutral-800 dark:text-orange-400"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Create Dropdown */}
        {hasCreateAccess && (
          <div className="relative" ref={createRef}>
            <button
              onClick={() => setCreateOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-sm bg-[var(--color-surface-muted)] px-4 py-2 transition-all hover:bg-orange-50 dark:hover:bg-neutral-800"
            >
              <PlusCircle size={16} />

              <span className="font-medium">Create</span>

              <ChevronDown size={16} />
            </button>

            {createOpen && (
              <div className="absolute left-0 z-50 mt-2 w-64 divide-y divide-gray-200 rounded-md border border-gray-300 bg-white shadow-lg">
                {/* Class / Meeting */}
                {(can(role, "class", "create") ||
                  can(role, "meeting", "create")) && (
                  <div className="p-2">
                    <p className="mb-1 text-xs font-semibold text-orange-600">
                      Class / Meeting
                    </p>

                    {can(role, "class", "create") && (
                      <Link
                        to="/classes/create"
                        className="flex items-center gap-2 rounded px-3 py-2 hover:bg-orange-100"
                      >
                        <BookOpen size={16} />
                        Class
                      </Link>
                    )}

                    {can(role, "meeting", "create") && (
                      <Link
                        to="/meetings/create"
                        className="flex items-center gap-2 rounded px-3 py-2 hover:bg-orange-100"
                      >
                        <Calendar size={16} />
                        Meeting
                      </Link>
                    )}
                  </div>
                )}

                {/* Admin / Mentor / Mentee */}
                {(can(role, "admin", "create") ||
                  can(role, "mentor", "create") ||
                  can(role, "mentee", "create")) && (
                  <div className="p-2">
                    <p className="mb-1 text-xs font-semibold text-green-600">
                      Admin / Mentor / Mentee
                    </p>

                    {can(role, "admin", "create") && (
                      <Link
                        to="/admins/create"
                        className="flex items-center gap-2 rounded px-3 py-2 hover:bg-green-100"
                      >
                        <UserStarIcon size={16} />
                        Admin
                      </Link>
                    )}

                    {can(role, "mentor", "create") && (
                      <Link
                        to="/mentors/create"
                        className="flex items-center gap-2 rounded px-3 py-2 hover:bg-green-100"
                      >
                        <UserPlus size={16} />
                        Mentor
                      </Link>
                    )}

                    {can(role, "mentee", "create") && (
                      <Link
                        to="/mentees/create"
                        className="flex items-center gap-2 rounded px-3 py-2 hover:bg-green-100"
                      >
                        <UserPlus size={16} />
                        Mentee
                      </Link>
                    )}
                  </div>
                )}

                {/* Task / Note / Material */}
                {(can(role, "task", "create") ||
                  can(role, "note", "create") ||
                  can(role, "material", "create")) && (
                  <div className="p-2">
                    <p className="mb-1 text-xs font-semibold text-blue-600">
                      Task / Note / Material
                    </p>

                    {can(role, "task", "create") && (
                      <Link
                        to="/tasks/create"
                        className="flex items-center gap-2 rounded px-3 py-2 hover:bg-blue-100"
                      >
                        <CheckSquare size={16} />
                        Task
                      </Link>
                    )}

                    {can(role, "note", "create") && (
                      <Link
                        to="/notes/create"
                        className="flex items-center gap-2 rounded px-3 py-2 hover:bg-blue-100"
                      >
                        <FileText size={16} />
                        Note
                      </Link>
                    )}

                    {can(role, "material", "create") && (
                      <Link
                        to="/materials/create"
                        className="flex items-center gap-2 rounded px-3 py-2 hover:bg-blue-100"
                      >
                        <Archive size={16} />
                        Material
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <NotificationBell />
        <UserDropdown user={user} />
      </div>
    </header>
  );
};

export default TopBar;
