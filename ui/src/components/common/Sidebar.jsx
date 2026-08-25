import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

import { MENU_BY_ROLE } from "@/constants/menu";

import AppLogo from "./AppLogo";

// Contextual promo content per sidebar section — swaps with the section
// that's currently active so the tip always feels relevant.
const SECTION_PROMO = {
  MAIN: {
    image: "/analytics-dashboard.png",
    title: "See the big picture",
    description: "Track classes, mentors, and progress from one dashboard.",
  },
  LEARNING: {
    image: "/task-checklist-edit.png",
    title: "Keep learning on track",
    description: "Create tasks, assign, and monitor progress easily.",
  },
  "MY LEARNING": {
    image: "/weekly-schedule-agenda.png",
    title: "Stay on schedule",
    description: "Keep up with your classes and meetings every week.",
  },
  CONTENT: {
    image: "/task-checklist-edit.png",
    title: "Keep learning on track",
    description: "Create tasks, assign, and monitor progress easily.",
  },
  "LEARNING RESOURCES": {
    image: "/course-materials-books.png",
    title: "Everything you need",
    description: "Tasks, notes, and materials, all in one place.",
  },
  PEOPLE: {
    image: "/student-group-study.png",
    title: "Grow your community",
    description: "Manage mentors and mentees in just a few clicks.",
  },
};

const Sidebar = ({ collapsed = false, onToggle }) => {
  const location = useLocation();

  const role = useSelector((state) => state.auth.user?.role);

  const sections = MENU_BY_ROLE[role] || [];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  // Promo content follows whichever section owns the current route,
  // falling back to the first section available.
  const activeSection =
    sections.find((section) =>
      section.items.some((item) => isActive(item.path)),
    ) || sections[0];

  const promo = SECTION_PROMO[activeSection?.title] || SECTION_PROMO.LEARNING;

  const navClass = (active) =>
    `group flex items-center rounded-sm py-3 transition-all duration-200 ${
      collapsed ? "justify-center px-0" : "mr-2 px-4"
    } ${
      active
        ? "bg-[var(--color-primary)] text-white shadow-sm"
        : "text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-white"
    }`;

  // Explicit color classes for the icon/label — don't rely on color
  // inheritance from the parent <Link>, some browsers/resets don't
  // propagate `currentColor` to nested svg/span reliably.
  const iconClass = (active) =>
    `shrink-0 transition-colors duration-200 ${
      active ? "text-white" : "text-[var(--color-text)] group-hover:text-white"
    }`;

  const labelClass = (active) =>
    `ml-3 text-sm font-medium transition-colors duration-200 ${
      active ? "text-white" : "text-[var(--color-text)] group-hover:text-white"
    }`;

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex border-b border-gray-200 p-4">
        <AppLogo collapsed={collapsed} />
      </div>

      {/* Collapse / expand toggle */}
      <button
        type="button"
        onClick={onToggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-[var(--color-surface)] text-[var(--color-text-muted)] shadow-sm transition hover:bg-[var(--color-primary)] hover:text-white"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.title} className="mb-6">
              {!collapsed && (
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  {section.title}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.path);

                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      title={collapsed ? item.name : undefined}
                      className={navClass(active)}
                    >
                      <Icon size={18} className={iconClass(active)} />

                      {!collapsed && (
                        <span className={labelClass(active)}>{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Contextual promo box */}
          {!collapsed && promo && (
            <div className="mt-2 overflow-hidden rounded-xl bg-orange-50/70 p-4 text-center">
              <img
                src={promo.image}
                alt={promo.title}
                className="mx-auto h-24 w-24 object-contain"
              />

              <p className="mt-3 text-sm font-semibold text-[var(--color-text)]">
                {promo.title}
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                {promo.description}
              </p>

              <button
                type="button"
                className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-sm bg-white px-3 py-2 text-xs font-semibold text-[var(--color-text)] shadow-sm transition hover:bg-orange-100"
              >
                Learn More <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
