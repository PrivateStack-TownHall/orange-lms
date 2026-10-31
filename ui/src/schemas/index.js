import {
  User,
  Mail,
  Lock,
  Image as ImageIcon,
  Cake,
  Phone,
  MapPin,
  FileText,
  Hash,
  BookOpen,
  Tags,
  BarChart3,
  Calendar,
  ShieldCheck,
  UserCog,
  ClipboardCheck,
  Award,
  Link2,
  Globe2,
  StickyNote,
  Folder,
  Timer,
} from "lucide-react";

// USER (shared by Admin, Mentor, Mentee creation)

export const userSchema = [
  {
    name: "name",
    label: "Full Name",
    type: "text",
    icon: User,
    color: "orange",
    placeholder: "Enter full name",
    helper: "Example: Budi Santoso",
  },

  {
    name: "email",
    label: "Email",
    type: "email",
    icon: Mail,
    color: "blue",
    placeholder: "Enter email address",
    helper: "Used to sign in to Orange LMS",
  },

  {
    name: "password",
    label: "Password",
    type: "text",
    icon: Lock,
    color: "gray",
    placeholder: "Enter password",
    helper: "Minimum 8 characters",
  },

  {
    name: "avatarUrl",
    label: "Avatar URL",
    type: "text",
    icon: ImageIcon,
    color: "purple",
    placeholder: "Enter avatar image URL",
    helper: "Optional profile picture",
  },

  {
    name: "age",
    label: "Age",
    type: "number",
    icon: Cake,
    color: "green",
    placeholder: "Enter age",
  },

  {
    name: "phoneNumber",
    label: "Phone Number",
    type: "text",
    icon: Phone,
    color: "amber",
    placeholder: "Enter phone number",
  },

  {
    name: "city",
    label: "City",
    type: "text",
    icon: MapPin,
    color: "red",
    placeholder: "Enter city",
  },

  {
    name: "background",
    label: "Professional Background",
    type: "textarea",
    icon: FileText,
    color: "orange",
    placeholder: "Short bio, experience, and expertise...",
    span: "full",
    showCount: true,
    maxLength: 500,
  },
];

// CLASS

export const classSchema = [
  {
    name: "code",
    label: "Class Code",
    type: "text",
    icon: Hash,
    color: "orange",
    placeholder: "Enter class code",
    helper: "Example: JSB-2025-01",
  },

  {
    name: "name",
    label: "Class Name",
    type: "text",
    icon: BookOpen,
    color: "orange",
    placeholder: "Enter class name",
    helper: "Example: JavaScript Basic",
  },

  {
    name: "description",
    label: "Description",
    type: "textarea",
    icon: FileText,
    color: "orange",
    placeholder: "Describe the class, what students will learn, and the goals...",
    showCount: true,
    maxLength: 500,
  },

  {
    name: "category",
    label: "Category",
    type: "select",
    icon: Tags,
    color: "purple",
    placeholder: "Select category",
    helper: "Choose the most relevant category",
    options: [
      { label: "Full Stack", value: "Full Stack" },
      { label: "Front End", value: "Front End" },
      { label: "Back End", value: "Back End" },
      { label: "JS Basic", value: "JS Basic" },
      { label: "Web Design", value: "Web Design" },
    ],
  },

  {
    name: "level",
    label: "Level",
    type: "select",
    icon: BarChart3,
    color: "purple",
    placeholder: "Select level",
    helper: "Beginner, Intermediate, or Advanced",
    options: [
      { label: "Beginner", value: "Beginner" },
      { label: "Intermediate", value: "Intermediate" },
      { label: "Advanced", value: "Advanced" },
    ],
  },

  {
    name: "startDate",
    label: "Start Date",
    type: "date",
    icon: Calendar,
    color: "green",
    helper: "When the class will begin",
  },

  {
    name: "endDate",
    label: "End Date",
    type: "date",
    icon: Calendar,
    color: "green",
    helper: "When the class will end",
  },

  {
    name: "MentorId",
    label: "Mentor",
    type: "select",
    icon: UserCog,
    color: "purple",
    placeholder: "Select mentor",
    helper: "Assign a mentor for this class",
    options: [],
  },

  {
    name: "status",
    label: "Status",
    type: "select",
    icon: ShieldCheck,
    color: "blue",
    placeholder: "Select status",
    helper: "Active or Draft",
    options: [
      { label: "Draft", value: "Draft" },
      { label: "Active", value: "Active" },
      { label: "Archived", value: "Archived" },
    ],
  },

  {
    name: "imageUrl",
    label: "Image URL (Optional)",
    type: "text",
    icon: ImageIcon,
    color: "blue",
    placeholder: "Enter image URL",
    helper: "Add a banner or thumbnail image for this class",
  },
];

// MEETING

export const meetingSchema = [
  {
    name: "meetingNumber",
    label: "Meeting Number",
    type: "number",
    icon: Hash,
    color: "orange",
    placeholder: "Enter meeting number",
    helper: "Example: 1",
  },

  {
    name: "name",
    label: "Meeting Name",
    type: "text",
    icon: Calendar,
    color: "orange",
    placeholder: "Enter meeting title",
    helper: "Example: Git dan GitHub",
  },

  {
    name: "description",
    label: "Description",
    type: "textarea",
    icon: FileText,
    color: "orange",
    placeholder: "Describe what will be covered in this meeting...",
    span: "full",
    showCount: true,
    maxLength: 500,
  },

  {
    name: "meetingDate",
    label: "Meeting Date",
    type: "date",
    icon: Calendar,
    color: "green",
    helper: "When this meeting will be held",
  },

  {
    name: "startHour",
    label: "Start Hour",
    type: "time",
    icon: Timer,
    color: "amber",
  },

  {
    name: "finishHour",
    label: "Finish Hour",
    type: "time",
    icon: Timer,
    color: "amber",
  },

  {
    name: "ClassId",
    label: "Class",
    type: "select",
    icon: BookOpen,
    color: "purple",
    placeholder: "Select class",
    helper: "Which class this meeting belongs to",
    options: [],
  },

  {
    name: "imageUrl",
    label: "Image URL (Optional)",
    type: "text",
    icon: ImageIcon,
    color: "blue",
    placeholder: "Enter image URL",
  },
];

// TASK

export const taskSchema = [
  {
    name: "name",
    label: "Task Title",
    type: "text",
    icon: ClipboardCheck,
    color: "orange",
    placeholder: "Enter task title",
    helper: "Example: JavaScript Fundamentals",
  },

  {
    name: "description",
    label: "Description",
    type: "textarea",
    icon: FileText,
    color: "orange",
    placeholder: "Describe the task and what students need to do...",
    span: "full",
    showCount: true,
    maxLength: 500,
  },

  {
    name: "maxScore",
    label: "Max Score",
    type: "number",
    icon: Award,
    color: "amber",
    placeholder: "Enter max score",
    helper: "Example: 100",
  },

  {
    name: "dueDate",
    label: "Due Date",
    type: "date",
    icon: Calendar,
    color: "green",
    helper: "Submission deadline",
  },

  {
    name: "status",
    label: "Status",
    type: "select",
    icon: ShieldCheck,
    color: "blue",
    placeholder: "Select status",
    options: [
      { label: "Draft", value: "Draft" },
      { label: "Published", value: "Published" },
      { label: "Archived", value: "Archived" },
    ],
  },

  {
    name: "ClassId",
    label: "Class",
    type: "select",
    icon: BookOpen,
    color: "purple",
    placeholder: "Select class",
    options: [],
  },

  {
    name: "MeetingId",
    label: "Meeting",
    type: "select",
    icon: Calendar,
    color: "purple",
    placeholder: "Select meeting",
    options: [],
  },

  {
    name: "fileUrl",
    label: "File URL (Optional)",
    type: "text",
    icon: Link2,
    color: "blue",
    placeholder: "Enter attachment URL",
  },
];

// NOTE

export const noteSchema = [
  {
    name: "name",
    label: "Note Title",
    type: "text",
    icon: StickyNote,
    color: "orange",
    placeholder: "Enter note title",
    helper: "Example: Pengenalan Git",
  },

  {
    name: "description",
    label: "Description",
    type: "textarea",
    icon: FileText,
    color: "orange",
    placeholder: "Write the note content...",
    span: "full",
    showCount: true,
    maxLength: 1000,
  },

  {
    name: "ClassId",
    label: "Class",
    type: "select",
    icon: BookOpen,
    color: "purple",
    placeholder: "Select class",
    options: [],
  },

  {
    name: "MeetingId",
    label: "Meeting",
    type: "select",
    icon: Calendar,
    color: "purple",
    placeholder: "Select meeting",
    options: [],
  },

  {
    name: "fileUrl",
    label: "File URL (Optional)",
    type: "text",
    icon: Link2,
    color: "blue",
    placeholder: "Enter attachment URL",
  },
];

// MATERIAL

export const materialSchema = [
  {
    name: "name",
    label: "Material Title",
    type: "text",
    icon: Folder,
    color: "orange",
    placeholder: "Enter material title",
    helper: "Example: Git Cheat Sheet",
  },

  {
    name: "description",
    label: "Description",
    type: "textarea",
    icon: FileText,
    color: "orange",
    placeholder: "Short description of this material...",
    span: "full",
    showCount: true,
    maxLength: 500,
  },

  {
    name: "type",
    label: "Material Type",
    type: "select",
    icon: Tags,
    color: "purple",
    placeholder: "Select material type",
    options: [
      { label: "PDF", value: "PDF" },
      { label: "JPG", value: "JPG" },
      { label: "URL", value: "URL" },
      { label: "Document", value: "Document" },
    ],
  },

  {
    name: "ClassId",
    label: "Class",
    type: "select",
    icon: BookOpen,
    color: "purple",
    placeholder: "Select class",
    options: [],
  },

  {
    name: "MeetingId",
    label: "Meeting",
    type: "select",
    icon: Calendar,
    color: "purple",
    placeholder: "Select meeting",
    options: [],
  },

  {
    name: "fileUrl",
    label: "File URL",
    type: "text",
    icon: Globe2,
    color: "blue",
    placeholder: "Enter file or link URL",
  },
];

// PROFILE (read-only)

export const profileSchema = [
  {
    name: "name",
    label: "Full Name",
    type: "text",
    icon: User,
    color: "orange",
    disabled: true,
  },

  {
    name: "email",
    label: "Email",
    type: "email",
    icon: Mail,
    color: "blue",
    disabled: true,
  },

  {
    name: "role",
    label: "Role",
    type: "text",
    icon: ShieldCheck,
    color: "purple",
    disabled: true,
  },

  {
    name: "active",
    label: "Status",
    type: "text",
    icon: ShieldCheck,
    color: "green",
    disabled: true,
  },

  {
    name: "age",
    label: "Age",
    type: "number",
    icon: Cake,
    color: "green",
    disabled: true,
  },

  {
    name: "phoneNumber",
    label: "Phone Number",
    type: "text",
    icon: Phone,
    color: "amber",
    disabled: true,
  },

  {
    name: "city",
    label: "City",
    type: "text",
    icon: MapPin,
    color: "red",
    disabled: true,
  },

  {
    name: "country",
    label: "Country",
    type: "text",
    icon: Globe2,
    color: "blue",
    disabled: true,
  },

  {
    name: "address",
    label: "Address",
    type: "textarea",
    icon: MapPin,
    color: "red",
    span: "full",
    disabled: true,
  },

  {
    name: "background",
    label: "Professional Background",
    type: "textarea",
    icon: FileText,
    color: "orange",
    span: "full",
    disabled: true,
  },
];
