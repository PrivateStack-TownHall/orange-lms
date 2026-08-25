import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  Users,
  UserCheck,
  ClipboardCheck,
  FileText,
  CalendarDays,
  ArrowRight,
  Upload,
  CheckCircle2,
  Archive,
} from "lucide-react";

import ClassService from "@/services/modules/class.service";
import MeetingService from "@/services/modules/meeting.service";
import TaskService from "@/services/modules/task.service";
import NoteService from "@/services/modules/note.service";
import MaterialService from "@/services/modules/material.service";
import MentorService from "@/services/modules/mentor.service";
import MenteeService from "@/services/modules/mentee.service";

import LoadingPage from "@/components/ui/loading/LoadingPage";
import StatsGrid from "@/components/ui/cards/StatsGrid";
import Avatar from "@/components/ui/avatar/Avatar";
import ProgressBar from "@/components/ui/progress/ProgressBar";

const DONUT_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#94a3b8"];

const isPastMeeting = (m) => m.meetingDate && new Date(m.meetingDate) < new Date();

const relativeDay = (date) => {
  const diff = Math.round(
    (new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000,
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff > 1) return `In ${diff} days`;
  return null;
};

const AdminDashboard = () => {
  const user = useSelector((state) => state.auth.user);

  const [classes, setClasses] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [classesRes, meetingsRes, tasksRes, notesRes, materialsRes, , menteesRes] =
          await Promise.all([
            ClassService.getAll(),
            MeetingService.getAll(),
            TaskService.getAll(),
            NoteService.getAll(),
            MaterialService.getAll(),
            MentorService.getAll(),
            MenteeService.getAll(),
          ]);

        setClasses(classesRes.data || []);
        setMeetings(meetingsRes.data || []);
        setTasks(tasksRes.data || []);
        setNotes(notesRes.data || []);
        setMaterials(materialsRes.data || []);
        setMentees(menteesRes.data || []);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = useMemo(
    () => [
      { title: "Total Classes", value: classes.length, description: "All classes", icon: Users, tone: "blue" },
      { title: "Active Mentees", value: mentees.filter((m) => m.isActive).length, description: "Currently active", icon: UserCheck, tone: "green" },
      { title: "Pending Tasks", value: tasks.filter((t) => t.status === "Draft").length, description: "Not published yet", icon: ClipboardCheck, tone: "amber" },
      { title: "Materials", value: materials.length, description: "Across all classes", icon: FileText, tone: "purple" },
      { title: "Upcoming Meetings", value: meetings.filter((m) => !isPastMeeting(m)).length, description: "Scheduled", icon: CalendarDays, tone: "orange" },
    ],
    [classes, mentees, tasks, materials, meetings],
  );

  const sortedMeetings = useMemo(
    () => [...meetings].sort((a, b) => new Date(a.meetingDate) - new Date(b.meetingDate)),
    [meetings],
  );

  const chartData = useMemo(() => {
    const totalMeetings = sortedMeetings.length || 1;
    const totalTasks = tasks.length || 1;

    return sortedMeetings.map((m, idx) => {
      const idsSoFar = sortedMeetings.slice(0, idx + 1).map((mm) => mm.id);
      const tasksSoFar = tasks.filter((t) => idsSoFar.includes(t.MeetingId)).length;

      return {
        name: `M${idx + 1}`,
        Meetings: Math.round(((idx + 1) / totalMeetings) * 100),
        Tasks: Math.round((tasksSoFar / totalTasks) * 100),
      };
    });
  }, [sortedMeetings, tasks]);

  const classDistribution = useMemo(() => {
    const groups = classes.reduce((acc, c) => {
      const key = c.category || "Other";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [classes]);

  const upcomingMeetings = useMemo(
    () => sortedMeetings.filter((m) => !isPastMeeting(m)).slice(0, 5),
    [sortedMeetings],
  );

  const recentActivities = useMemo(() => {
    const items = [
      ...materials.map((m) => ({ icon: Upload, tone: "bg-green-100 text-green-600", text: `${m.uploader?.name || "Someone"} uploaded a new material`, sub: m.name, date: m.createdAt })),
      ...tasks.map((t) => ({ icon: ClipboardCheck, tone: "bg-blue-100 text-blue-600", text: `${t.creator?.name || "Someone"} created a new task`, sub: t.name, date: t.createdAt })),
      ...notes.map((n) => ({ icon: FileText, tone: "bg-orange-100 text-orange-600", text: `${n.creator?.name || "Someone"} added meeting notes`, sub: n.name, date: n.createdAt })),
    ];

    return items
      .filter((i) => i.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [materials, tasks, notes]);

  const taskStatusData = useMemo(() => {
    const groups = tasks.reduce((acc, t) => {
      acc[t.status || "Draft"] = (acc[t.status || "Draft"] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const topClasses = useMemo(() => {
    return [...classes]
      .map((c) => {
        const total = c.meetings?.length || 0;
        const held = c.meetings?.filter(isPastMeeting).length || 0;
        return { ...c, progress: total ? Math.round((held / total) * 100) : 0 };
      })
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 4);
  }, [classes]);

  if (loading) {
    return <LoadingPage title="Loading Dashboard..." />;
  }

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Good morning, {user?.name || "Admin"}! 👋
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Here's what's happening with your learning platform today.
        </p>
      </div>

      <StatsGrid items={stats} columns={5} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Learning Progress Overview</h2>
            <span className="rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)]">
              Cumulative
            </span>
          </div>

          {chartData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="%" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="Meetings" stroke="#3b82f6" fill="url(#colorMeetings)" strokeWidth={2} />
                <Area type="monotone" dataKey="Tasks" stroke="#22c55e" fill="url(#colorTasks)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-sm text-[var(--color-text-muted)]">No data yet.</p>
          )}
        </div>

        <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
          <h2 className="mb-4 text-base font-semibold">Class Distribution</h2>

          {classDistribution.length ? (
            <>
              <div className="relative mx-auto h-40 w-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={classDistribution} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                      {classDistribution.map((entry, index) => (
                        <Cell key={entry.name} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">{classes.length}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">Total Classes</span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                {classDistribution.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }} />
                      {entry.name}
                    </span>
                    <span className="font-medium">
                      {entry.value} ({Math.round((entry.value / classes.length) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="py-10 text-center text-sm text-[var(--color-text-muted)]">No classes yet.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Activities</h2>
            <Link to="/materials" className="flex items-center gap-1 text-xs font-medium text-[var(--color-primary)]">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivities.length === 0 && (
              <p className="text-xs text-[var(--color-text-muted)]">No recent activity.</p>
            )}
            {recentActivities.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.tone}`}>
                  <item.icon size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate">{item.text}</p>
                  <p className="truncate text-xs text-[var(--color-text-muted)]">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
          <h2 className="mb-3 text-base font-semibold">Task Overview</h2>

          {taskStatusData.length ? (
            <div className="flex items-center gap-4">
              <div className="relative h-32 w-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={taskStatusData} dataKey="value" nameKey="name" innerRadius={36} outerRadius={58} paddingAngle={2}>
                      {taskStatusData.map((entry, index) => (
                        <Cell key={entry.name} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold">{tasks.length}</span>
                  <span className="text-[9px] text-[var(--color-text-muted)]">Total Tasks</span>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-sm">
                {taskStatusData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }} />
                      {entry.name}
                    </span>
                    <span className="font-medium">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-[var(--color-text-muted)]">No tasks yet.</p>
          )}
        </div>

        <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Upcoming Meetings</h2>
            <Link to="/meetings" className="flex items-center gap-1 text-xs font-medium text-[var(--color-primary)]">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingMeetings.length === 0 && (
              <p className="text-xs text-[var(--color-text-muted)]">No upcoming meetings.</p>
            )}
            {upcomingMeetings.map((m) => (
              <Link
                key={m.id}
                to={`/meetings/${m.id}`}
                className="flex items-start gap-3 rounded-sm p-1.5 text-sm transition-colors hover:bg-gray-50"
              >
                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-sm bg-orange-50 text-[10px] font-semibold uppercase text-orange-600">
                  <span>{new Date(m.meetingDate).toLocaleDateString("en", { month: "short" })}</span>
                  <span className="text-sm">{new Date(m.meetingDate).getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{m.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {m.class?.name} · {m.startHour}
                  </p>
                </div>
                {relativeDay(m.meetingDate) && (
                  <span className="shrink-0 rounded-sm bg-blue-100 px-2 py-1 text-[10px] font-medium text-blue-700">
                    {relativeDay(m.meetingDate)}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Top Performing Classes</h2>
          <Link to="/classes" className="flex items-center gap-1 text-xs font-medium text-[var(--color-primary)]">
            View All <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {topClasses.length === 0 && (
            <p className="text-xs text-[var(--color-text-muted)]">No classes yet.</p>
          )}

          {topClasses.map((cls) => (
            <Link
              key={cls.id}
              to={`/classes/${cls.id}`}
              className="rounded-sm border border-gray-100 p-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-orange-100 text-xs font-bold text-orange-600">
                  {cls.code?.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{cls.name}</p>
                  <p className="truncate text-xs text-[var(--color-text-muted)]">
                    {cls.mentor?.name || "-"}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar value={cls.progress} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
