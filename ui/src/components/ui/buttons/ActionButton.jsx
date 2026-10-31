import React from "react";
import { Link } from "react-router-dom";

import {
  Eye,
  Pencil,
  Trash2,
  Download,
  Plus,
  UserPlus,
  CheckSquare,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";

import { can } from "@/helpers";

const ACTIONS = {
  detail: {
    icon: Eye,
    label: "Details",
    className: "bg-sky-100 text-sky-700 hover:bg-sky-200",
  },

  view: {
    icon: Eye,
    label: "View",
    className: "bg-sky-100 text-sky-700 hover:bg-sky-200",
  },

  edit: {
    icon: Pencil,
    label: "Edit",
    className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  },

  delete: {
    icon: Trash2,
    label: "Remove",
    className:
      "text-[var(--color-text-muted)] hover:bg-rose-50 hover:text-rose-600",
  },

  download: {
    icon: Download,
    label: "Download",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  },

  create: {
    icon: Plus,
    label: "Create",
    className: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  },

  assign: {
    icon: UserPlus,
    label: "Assign",
    className: "bg-violet-100 text-violet-700 hover:bg-violet-200",
  },

  submit: {
    icon: CheckSquare,
    label: "Submit",
    className: "bg-green-100 text-green-700 hover:bg-green-200",
  },

  review: {
    icon: ClipboardCheck,
    label: "Review",
    className: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  },

  grade: {
    icon: GraduationCap,
    label: "Grade",
    className: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  },
};

const ActionButton = ({
  action,

  to,
  href,

  onClick,

  role,
  resource,
  permission,

  children,

  className = "",
}) => {
  if (role && resource && permission && !can(role, resource, permission)) {
    return null;
  }

  const config = ACTIONS[action];

  if (!config) return null;

  const Icon = config.icon;

  const content = (
    <>
      <Icon size={14} />
      <span>{children || config.label}</span>
    </>
  );

  const styles = `
    inline-flex items-center gap-1
    rounded-sm px-2 py-1
    text-xs font-medium
    transition-colors
    ${config.className}
    ${className}
  `;

  // External Link / Download
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={styles}>
        {content}
      </a>
    );
  }

  // Internal Navigation
  if (to) {
    return (
      <Link to={to} className={styles}>
        {content}
      </Link>
    );
  }

  // Button Action / Popup / API Call
  return (
    <button type="button" onClick={onClick} className={styles}>
      {content}
    </button>
  );
};

export default ActionButton;
