import {
  Activity,
  Archive,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  CheckSquare,
  ClipboardCheck,
  FileText,
  History,
  Home,
  Shield,
  User,
  Users,
} from "lucide-react";

import ROLES from "./roles";
import ROUTES from "./routes";

const learningItems = [
  { name: "Classes", icon: BookOpen, path: ROUTES.CLASSES },
  { name: "Meetings", icon: Calendar, path: ROUTES.MEETINGS },
  { name: "Tasks", icon: CheckSquare, path: ROUTES.TASKS },
  { name: "Notes", icon: FileText, path: ROUTES.NOTES },
  { name: "Materials", icon: Archive, path: ROUTES.MATERIALS },
];

const assessmentItems = [
  { name: "Attendance", icon: ClipboardCheck, path: ROUTES.ATTENDANCE },
  { name: "Assessments", icon: ClipboardCheck, path: ROUTES.ASSESSMENTS },
];

const ownerAdminReports = [
  ...assessmentItems,
  { name: "History Classes", icon: History, path: ROUTES.HISTORY_CLASSES },
  { name: "Certificates", icon: Award, path: ROUTES.CERTIFICATES },
];

const mainSection = {
  title: "MAIN",
  items: [{ name: "Dashboard", icon: Home, path: ROUTES.DASHBOARD }],
};

export const MENU_BY_ROLE = {
  [ROLES.OWNER]: [
    mainSection,
    { title: "LEARNING", items: learningItems },
    {
      title: "PEOPLE",
      items: [
        { name: "Admins", icon: User, path: ROUTES.ADMINS },
        { name: "Mentors", icon: User, path: ROUTES.MENTORS },
        { name: "Mentees", icon: Users, path: ROUTES.MENTEES },
      ],
    },
    {
      title: "REPORTS",
      items: [...ownerAdminReports, { name: "Reports", icon: BarChart3, path: ROUTES.REPORTS }],
    },
    {
      title: "ADMINISTRATION",
      items: [
        { name: "Audit Log", icon: Shield, path: ROUTES.AUDIT_LOG },
        { name: "User Activity", icon: Activity, path: ROUTES.USER_ACTIVITY },
      ],
    },
  ],
  [ROLES.ADMIN]: [
    mainSection,
    { title: "LEARNING", items: learningItems },
    {
      title: "PEOPLE",
      items: [
        { name: "Mentors", icon: User, path: ROUTES.MENTORS },
        { name: "Mentees", icon: Users, path: ROUTES.MENTEES },
      ],
    },
    { title: "REPORTS", items: ownerAdminReports },
    {
      title: "ADMINISTRATION",
      items: [
        { name: "Audit Log", icon: Shield, path: ROUTES.AUDIT_LOG },
        { name: "User Activity", icon: Activity, path: ROUTES.USER_ACTIVITY },
      ],
    },
  ],
  [ROLES.MENTOR]: [
    mainSection,
    { title: "MY LEARNING", items: learningItems.slice(0, 2) },
    { title: "CONTENT", items: learningItems.slice(2) },
    { title: "REPORTS", items: assessmentItems },
  ],
  [ROLES.MENTEE]: [
    mainSection,
    { title: "MY LEARNING", items: learningItems.slice(0, 2) },
    { title: "LEARNING RESOURCES", items: learningItems.slice(2) },
    { title: "REPORTS", items: assessmentItems },
  ],
};
