import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

import {
  Calendar,
  Clock,
  BookOpen,
  User,
  CheckSquare,
  FileText,
  Archive,
  Users,
  Edit2,
  Trash2,
  Download,
  Eye,
  Plus,
  Info,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Upload,
  ClipboardCheck,
} from "lucide-react";

import usePopupStore from "@/app/store/popupStore";

import MeetingService from "@/services/modules/meeting.service";
import AttendanceService from "@/services/modules/attendance.service";

import SubmissionsTab from "./components/SubmissionsTab";

import { useBreadcrumbs } from "@/hooks";
import { formatDate } from "@/helpers";

import PageHeader from "@/components/ui/page/PageHeader";
import LoadingPage from "@/components/ui/loading/LoadingPage";
import TabHeader from "@/components/ui/tabs/TabHeader";
import TabContent from "@/components/ui/tabs/TabContent";
import StatsGrid from "@/components/ui/cards/StatsGrid";
import StatusBadge from "@/components/ui/status/StatusBadge";
import Avatar from "@/components/ui/avatar/Avatar";
import Button from "@/components/ui/buttons/Button";
import Table from "@/components/ui/tables/Table";

const ATTENDANCE_TONE = {
  Present: "bg-green-100 text-green-700",
  Late: "bg-amber-100 text-amber-700",
  Absent: "bg-red-100 text-red-700",
  Excused: "bg-blue-100 text-blue-700",
};

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const breadcrumbs = useBreadcrumbs([{ label: "Meetings", to: "/meetings" }]);

  const { openConfirm, openError, openSuccess } = usePopupStore();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [attendances, setAttendances] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [markStatuses, setMarkStatuses] = useState({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  const fetchMeeting = async () => {
    try {
      const res = await MeetingService.getById(id);
      setMeeting(res.data);
    } catch (error) {
      console.error(error);
      openError({
        title: "Load Failed",
        message: error?.response?.data?.message || "Failed to load meeting.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeeting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAttendances = async () => {
    setAttendanceLoading(true);
    try {
      const res = await AttendanceService.getByMeeting(id);
      setAttendances(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, id]);

  const mentees = useMemo(() => meeting?.class?.mentees || [], [meeting]);

  const attendanceRows = useMemo(() => {
    return mentees.map((mentee) => {
      const record = attendances.find((a) => a.UserId === mentee.id);
      return {
        ...mentee,
        attendance: record || null,
      };
    });
  }, [mentees, attendances]);

  const attendanceSummary = useMemo(() => {
    const total = attendanceRows.length;
    const present = attendanceRows.filter((r) => r.attendance?.status === "Present").length;
    const notMarked = attendanceRows.filter((r) => !r.attendance).length;
    const absent = total - present - notMarked;
    return { total, present, absent, notMarked };
  }, [attendanceRows]);

  const handleDeleteMeeting = () => {
    openConfirm({
      title: "Delete Meeting",
      message:
        "Are you sure you want to delete this meeting? This action cannot be undone.",
      action: async () => {
        try {
          await MeetingService.delete(meeting.id);
          openSuccess({ title: "Deleted", message: "Meeting deleted successfully." });
          navigate("/meetings");
        } catch (error) {
          console.error(error);
          openError({
            title: "Delete Failed",
            message: error?.response?.data?.message || "Failed to delete meeting.",
          });
        }
      },
    });
  };

  const openMarkAttendance = () => {
    const initial = {};
    attendanceRows.forEach((row) => {
      initial[row.id] = row.attendance?.status || "Present";
    });
    setMarkStatuses(initial);
    setActiveTab("attendance-marking");
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    try {
      await Promise.all(
        attendanceRows.map((row) => {
          const status = markStatuses[row.id];
          if (row.attendance) {
            if (row.attendance.status === status) return Promise.resolve();
            return AttendanceService.update(row.attendance.id, { status });
          }
          return AttendanceService.mark({
            MeetingId: Number(id),
            UserId: row.id,
            status,
          });
        }),
      );

      await fetchAttendances();
      setActiveTab("attendance");
      openSuccess({ title: "Saved", message: "Attendance updated successfully." });
    } catch (error) {
      console.error(error);
      openError({
        title: "Failed",
        message: error?.response?.data?.message || "Failed to save attendance.",
      });
    } finally {
      setSavingAttendance(false);
    }
  };

  if (loading) {
    return <LoadingPage title="Loading Meeting..." />;
  }

  if (!meeting) {
    return (
      <div className="p-4">
        <p className="rounded-sm border border-red-200 bg-red-50 p-4 text-red-600">
          Meeting not found.
        </p>
      </div>
    );
  }

  const tabs = [
    { value: "overview", label: "Overview", icon: Info },
    { value: "tasks", label: "Tasks", icon: CheckSquare },
    { value: "notes", label: "Notes", icon: FileText },
    { value: "materials", label: "Materials", icon: Archive },
    { value: "attendance", label: "Attendance", icon: Users },
    { value: "submissions", label: "Submissions", icon: ClipboardCheck },
  ];

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          breadcrumbs={[
            ...breadcrumbs,
            { label: meeting.class?.name, to: `/classes/${meeting.class?.id}` },
            { label: meeting.name },
          ]}
          title={meeting.name}
          actions={
            <span className="inline-block rounded-sm bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
              Meeting #{meeting.meetingNumber}
            </span>
          }
        />

        <div className="flex gap-2">
          <Link to={`/meetings/edit/${meeting.id}`}>
            <Button variant="info" size="sm">
              <Edit2 size={14} />
              Edit
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={handleDeleteMeeting}>
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-sm bg-purple-100">
                <Calendar size={32} className="text-purple-600" />
              </div>

              <h2 className="mt-4 text-lg font-bold">{meeting.name}</h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Meeting #{meeting.meetingNumber}
              </p>

              <div className="mt-5 w-full space-y-4 text-left text-sm">
                <SidebarField icon={BookOpen} label="Class">
                  <p className="font-medium">{meeting.class?.code}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{meeting.class?.name}</p>
                </SidebarField>

                <SidebarField icon={Calendar} label="Date">
                  {formatDate(meeting.meetingDate)}
                </SidebarField>

                <SidebarField icon={Clock} label="Time">
                  {meeting.startHour || "-"} - {meeting.finishHour || "-"}
                </SidebarField>

                <SidebarField icon={User} label="Mentor">
                  {meeting.class?.mentor?.name || "-"}
                </SidebarField>

                <SidebarField icon={User} label="Created By">
                  {meeting.creator?.name || "-"}
                </SidebarField>
              </div>

              <div className="mt-5 w-full rounded-sm bg-gray-50 p-3 text-left">
                <p className="text-xs text-gray-500">Description</p>
                <p className="mt-1 text-sm">{meeting.description || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4 lg:col-span-3">
          <TabHeader tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

          <TabContent activeTab={activeTab} value="overview">
            <div className="space-y-4">
              <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
                <h3 className="mb-3 text-base font-semibold">About This Meeting</h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {meeting.description || "No description provided."}
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <MiniStat icon={CheckSquare} tone="bg-orange-100 text-orange-600" label="Tasks" value={meeting.tasks?.length || 0} />
                  <MiniStat icon={FileText} tone="bg-green-100 text-green-600" label="Notes" value={meeting.notes?.length || 0} />
                  <MiniStat icon={Archive} tone="bg-blue-100 text-blue-600" label="Materials" value={meeting.materials?.length || 0} />
                </div>
              </div>

              <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold">Tasks</h3>
                  <button
                    onClick={() => setActiveTab("tasks")}
                    className="flex items-center gap-1 text-xs font-medium text-[var(--color-primary)]"
                  >
                    View All Tasks <ArrowRight size={12} />
                  </button>
                </div>

                {meeting.tasks?.length ? (
                  <div className="space-y-2">
                    {meeting.tasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between gap-3 rounded-sm border border-gray-200 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-orange-100 text-orange-600">
                            <CheckSquare size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{task.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">
                              Max Score: {task.maxScore || "-"} · Due: {task.dueDate ? formatDate(task.dueDate) : "-"}
                            </p>
                          </div>
                        </div>
                        <Link
                          to={`/tasks/${task.id}`}
                          className="flex shrink-0 items-center gap-1 rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                        >
                          <Eye size={12} /> View Task
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-text-muted)]">No tasks yet.</p>
                )}
              </div>

              <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold">Materials</h3>
                  <button
                    onClick={() => setActiveTab("materials")}
                    className="flex items-center gap-1 text-xs font-medium text-[var(--color-primary)]"
                  >
                    View All Materials <ArrowRight size={12} />
                  </button>
                </div>

                {meeting.materials?.length ? (
                  <div className="space-y-2">
                    {meeting.materials.slice(0, 2).map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between gap-3 rounded-sm border border-gray-200 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-blue-100 text-blue-600">
                            <FileText size={16} />
                          </div>
                          <p className="text-sm font-semibold">{material.name}</p>
                        </div>
                        {material.fileUrl && (
                          <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex shrink-0 items-center gap-1 rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                          >
                            <Download size={12} /> Download
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-text-muted)]">No materials yet.</p>
                )}
              </div>
            </div>
          </TabContent>

          <TabContent activeTab={activeTab} value="tasks">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Tasks</h3>
                <Link to="/tasks/create">
                  <Button size="sm">
                    <Plus size={14} /> Add Task
                  </Button>
                </Link>
              </div>

              <StatsGrid
                columns={4}
                items={[
                  { title: "Total Tasks", value: meeting.tasks?.length || 0, icon: CheckSquare, tone: "blue" },
                  { title: "Published", value: meeting.tasks?.filter((t) => t.status === "Published").length || 0, icon: FileText, tone: "orange" },
                  { title: "Draft", value: meeting.tasks?.filter((t) => t.status === "Draft").length || 0, icon: Archive, tone: "gray" },
                  {
                    title: "Due Soon",
                    value: meeting.tasks?.filter((t) => t.dueDate && new Date(t.dueDate) > new Date() && new Date(t.dueDate) < new Date(Date.now() + 7 * 86400000)).length || 0,
                    icon: Clock,
                    tone: "purple",
                  },
                ]}
              />

              <div className="overflow-hidden rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
                <Table
                  columns={[
                    { key: "name", label: "Task" },
                    { key: "maxScore", label: "Max Score" },
                    { key: "dueDate", label: "Due Date", render: (row) => formatDate(row.dueDate) },
                    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
                    {
                      key: "actions",
                      label: "Actions",
                      render: (row) => (
                        <Link
                          to={`/tasks/${row.id}`}
                          className="inline-flex items-center gap-1 rounded-sm bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                        >
                          <Eye size={14} /> View
                        </Link>
                      ),
                    },
                  ]}
                  data={meeting.tasks || []}
                />
              </div>
            </div>
          </TabContent>

          <TabContent activeTab={activeTab} value="notes">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Meeting Notes</h3>
                <Link to="/notes/create">
                  <Button size="sm">
                    <Plus size={14} /> Add Note
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {meeting.notes?.length ? (
                  meeting.notes.map((note) => (
                    <div key={note.id} className="flex items-start justify-between gap-3 rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-amber-100 text-amber-600">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{note.name}</p>
                          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                            {note.description || "-"}
                          </p>
                        </div>
                      </div>
                      {note.fileUrl && (
                        <a
                          href={note.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex shrink-0 items-center gap-1 rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                        >
                          <Download size={12} /> Download
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[var(--color-text-muted)]">No notes yet.</p>
                )}
              </div>
            </div>
          </TabContent>

          <TabContent activeTab={activeTab} value="materials">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Meeting Materials</h3>
                <Link to="/materials/create">
                  <Button size="sm">
                    <Upload size={14} /> Upload Material
                  </Button>
                </Link>
              </div>

              <div className="overflow-hidden rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
                <Table
                  columns={[
                    { key: "name", label: "Material" },
                    { key: "type", label: "Type" },
                    {
                      key: "fileUrl",
                      label: "Attachment",
                      render: (row) =>
                        row.fileUrl ? (
                          <a
                            href={row.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-sm bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                          >
                            <Download size={12} /> Download
                          </a>
                        ) : (
                          "-"
                        ),
                    },
                  ]}
                  data={meeting.materials || []}
                />
              </div>
            </div>
          </TabContent>

          <TabContent activeTab={activeTab} value="attendance">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Attendance</h3>
                <Button size="sm" onClick={openMarkAttendance}>
                  <CheckCircle2 size={14} /> Mark Attendance
                </Button>
              </div>

              <StatsGrid
                columns={4}
                items={[
                  { title: "Total Mentees", value: attendanceSummary.total, icon: Users, tone: "blue" },
                  { title: "Present", value: attendanceSummary.present, icon: CheckCircle2, tone: "green" },
                  { title: "Absent", value: attendanceSummary.absent, icon: XCircle, tone: "red" },
                  { title: "Not Marked", value: attendanceSummary.notMarked, icon: HelpCircle, tone: "amber" },
                ]}
              />

              <div className="overflow-hidden rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
                {attendanceLoading ? (
                  <p className="py-6 text-center text-sm text-[var(--color-text-muted)]">
                    Loading attendance...
                  </p>
                ) : (
                  <Table
                    columns={[
                      {
                        key: "name",
                        label: "Mentee",
                        render: (row) => (
                          <div className="flex items-center gap-2">
                            <Avatar name={row.name} size="xs" />
                            <span>{row.name}</span>
                          </div>
                        ),
                      },
                      {
                        key: "status",
                        label: "Status",
                        render: (row) =>
                          row.attendance ? (
                            <span
                              className={`rounded-sm px-2 py-1 text-xs font-medium ${
                                ATTENDANCE_TONE[row.attendance.status] || "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {row.attendance.status}
                            </span>
                          ) : (
                            <span className="rounded-sm bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                              Not Marked
                            </span>
                          ),
                      },
                      {
                        key: "checkInAt",
                        label: "Checked In",
                        render: (row) =>
                          row.attendance?.checkInAt
                            ? new Date(row.attendance.checkInAt).toLocaleString("id-ID")
                            : "-",
                      },
                      {
                        key: "checker",
                        label: "Marked By",
                        render: (row) => row.attendance?.checker?.name || "-",
                      },
                    ]}
                    data={attendanceRows}
                  />
                )}
              </div>
            </div>
          </TabContent>

          <TabContent activeTab={activeTab} value="attendance-marking">
            <div className="space-y-4 rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
              <h3 className="text-base font-semibold">Mark Attendance</h3>

              <div className="space-y-2">
                {attendanceRows.map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-gray-200 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar name={row.name} size="xs" />
                      <span className="text-sm font-medium">{row.name}</span>
                    </div>

                    <div className="flex gap-1">
                      {["Present", "Late", "Absent", "Excused"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() =>
                            setMarkStatuses((prev) => ({ ...prev, [row.id]: status }))
                          }
                          className={`rounded-sm px-2.5 py-1 text-xs font-medium transition-colors ${
                            markStatuses[row.id] === status
                              ? ATTENDANCE_TONE[status]
                              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <Button variant="outline" onClick={() => setActiveTab("attendance")}>
                  Cancel
                </Button>
                <Button onClick={handleSaveAttendance} disabled={savingAttendance}>
                  {savingAttendance ? "Saving..." : "Save Attendance"}
                </Button>
              </div>
            </div>
          </TabContent>

          <TabContent activeTab={activeTab} value="submissions">
            <SubmissionsTab tasks={meeting.tasks || []} />
          </TabContent>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link
          to="/meetings"
          className="inline-flex items-center gap-2 rounded-sm border border-gray-200 bg-[var(--color-surface)] px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          <ArrowLeft size={14} /> Back to Meetings
        </Link>
      </div>
    </div>
  );
};

const SidebarField = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-2">
    <Icon size={15} className="mt-0.5 shrink-0 text-[var(--color-text-muted)]" />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <div>{children}</div>
    </div>
  </div>
);

const MiniStat = ({ icon: Icon, tone, label, value }) => (
  <div className="flex items-center gap-3 rounded-sm bg-gray-50 p-3">
    <div className={`flex h-9 w-9 items-center justify-center rounded-sm ${tone}`}>
      <Icon size={16} />
    </div>
    <div>
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  </div>
);

export default Detail;
