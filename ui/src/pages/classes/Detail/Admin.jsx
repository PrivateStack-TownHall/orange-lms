import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  ResponsiveContainer,
  LineChart,
  Line,
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
  Calendar,
  Users,
  CheckSquare,
  FileText,
  Archive,
  LayoutGrid,
  TrendingUp,
  Edit2,
  Trash2,
  Eye,
  Download,
  Upload,
  ClipboardCheck,
  UserPlus,
} from "lucide-react";

import usePopupStore from "@/app/store/popupStore";

import ClassService from "@/services/modules/class.service";
import MenteeService from "@/services/modules/mentee.service";

import { useBreadcrumbs } from "@/hooks";
import { formatDate } from "@/helpers";

import PageHeader from "@/components/ui/page/PageHeader";
import LoadingPage from "@/components/ui/loading/LoadingPage";
import TabHeader from "@/components/ui/tabs/TabHeader";
import TabContent from "@/components/ui/tabs/TabContent";
import Table from "@/components/ui/tables/Table";
import StatsGrid from "@/components/ui/cards/StatsGrid";
import StatusBadge from "@/components/ui/status/StatusBadge";
import Avatar from "@/components/ui/avatar/Avatar";
import PopUp from "@/components/ui/popup/PopUp";
import Button from "@/components/ui/buttons/Button";

const DONUT_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#a855f7", "#94a3b8"];

const isPastMeeting = (m) => m.meetingDate && new Date(m.meetingDate) < new Date();

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const breadcrumbs = useBreadcrumbs([{ label: "Classes", to: "/classes" }]);

  const { openConfirm, openError, openSuccess } = usePopupStore();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Enroll mentee (bulk)
  const [openEnrollPopup, setOpenEnrollPopup] = useState(false);
  const [availableMentees, setAvailableMentees] = useState([]);
  const [selectedMentees, setSelectedMentees] = useState([]);

  const fetchClass = async () => {
    try {
      const res = await ClassService.getById(+id);
      setClassData(res.data);
    } catch (error) {
      console.error(error);
      openError({
        title: "Load Failed",
        message: error?.response?.data?.message || "Failed to load class.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClass();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleOpenEnroll = async () => {
    try {
      const res = await MenteeService.getAll();
      const enrolledIds = classData?.mentees?.map((m) => m.id) || [];
      setAvailableMentees((res.data || []).filter((m) => !enrolledIds.includes(m.id)));
      setSelectedMentees([]);
      setOpenEnrollPopup(true);
    } catch (error) {
      console.error(error);
      openError({ title: "Load Failed", message: "Failed to load mentees." });
    }
  };

  const toggleMentee = (menteeId) => {
    setSelectedMentees((prev) =>
      prev.includes(menteeId) ? prev.filter((m) => m !== menteeId) : [...prev, menteeId],
    );
  };

  const handleAssignMentees = async () => {
    if (!selectedMentees.length) return;
    try {
      await ClassService.enrollMentees(classData.id, { UserIds: selectedMentees });
      await fetchClass();
      setOpenEnrollPopup(false);
      openSuccess({ title: "Success", message: "Mentees added to class." });
    } catch (error) {
      console.error(error);
      openError({
        title: "Failed",
        message: error?.response?.data?.message || "Failed to add mentees.",
      });
    }
  };

  const handleRemoveMentee = (mentee) => {
    openConfirm({
      title: "Remove Mentee",
      message: `Remove ${mentee.name} from this class?`,
      action: async () => {
        try {
          await ClassService.removeMentee(classData.id, mentee.id);
          await fetchClass();
          openSuccess({ title: "Removed", message: "Mentee removed from class." });
        } catch (error) {
          console.error(error);
          openError({
            title: "Failed",
            message: error?.response?.data?.message || "Failed to remove mentee.",
          });
        }
      },
    });
  };

  const handleDeleteClass = () => {
    openConfirm({
      title: "Delete Class",
      message:
        "Are you sure you want to delete this class? This action cannot be undone.",
      action: async () => {
        try {
          await ClassService.delete(classData.id);
          openSuccess({ title: "Deleted", message: "Class deleted successfully." });
          navigate("/classes");
        } catch (error) {
          console.error(error);
          openError({
            title: "Delete Failed",
            message: error?.response?.data?.message || "Failed to delete class.",
          });
        }
      },
    });
  };

  // ===== Derived data (memoized, only recompute when classData changes) =====

  const meetings = useMemo(() => classData?.meetings || [], [classData]);
  const mentees = useMemo(() => classData?.mentees || [], [classData]);
  const tasks = useMemo(() => classData?.tasks || [], [classData]);
  const notes = useMemo(() => classData?.notes || [], [classData]);
  const materials = useMemo(() => classData?.materials || [], [classData]);

  const sortedMeetings = useMemo(
    () =>
      [...meetings].sort(
        (a, b) => new Date(a.meetingDate) - new Date(b.meetingDate),
      ),
    [meetings],
  );

  const chartData = useMemo(() => {
    const totalMeetings = sortedMeetings.length || 1;
    const totalTasks = tasks.length || 1;

    return sortedMeetings.map((m, idx) => {
      const heldSoFar = idx + 1;
      const idsSoFar = sortedMeetings.slice(0, idx + 1).map((mm) => mm.id);
      const tasksSoFar = tasks.filter((t) => idsSoFar.includes(t.MeetingId)).length;

      return {
        name: `M${m.meetingNumber ?? idx + 1}`,
        Meetings: Math.round((heldSoFar / totalMeetings) * 100),
        Tasks: Math.round((tasksSoFar / totalTasks) * 100),
      };
    });
  }, [sortedMeetings, tasks]);

  const taskStatusData = useMemo(() => {
    const groups = tasks.reduce((acc, t) => {
      acc[t.status || "Draft"] = (acc[t.status || "Draft"] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const materialTypeData = useMemo(() => {
    const groups = materials.reduce((acc, m) => {
      const key = m.type || "Other";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [materials]);

  const activity = useMemo(() => {
    const items = [
      ...materials.map((m) => ({
        icon: Upload,
        tone: "bg-green-100 text-green-600",
        text: `Material uploaded: ${m.name}`,
        date: m.createdAt,
      })),
      ...tasks.map((t) => ({
        icon: ClipboardCheck,
        tone: "bg-blue-100 text-blue-600",
        text: `Task created: ${t.name}`,
        date: t.createdAt,
      })),
      ...notes.map((n) => ({
        icon: FileText,
        tone: "bg-orange-100 text-orange-600",
        text: `Note added: ${n.name}`,
        date: n.createdAt,
      })),
      ...mentees.map((m) => ({
        icon: UserPlus,
        tone: "bg-purple-100 text-purple-600",
        text: `Mentee joined: ${m.name}`,
        date: m.ClassUser?.createdAt || classData?.createdAt,
      })),
    ];

    return items
      .filter((i) => i.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materials, tasks, notes, mentees]);

  if (loading) {
    return <LoadingPage title="Loading Class..." />;
  }

  if (!classData) {
    return (
      <div className="p-4">
        <p className="rounded-sm border border-red-200 bg-red-50 p-4 text-red-600">
          Class not found.
        </p>
      </div>
    );
  }

  const tabs = [
    { value: "overview", label: "Overview", icon: LayoutGrid },
    { value: "meetings", label: "Meetings", icon: Calendar },
    { value: "mentees", label: "Mentees", icon: Users },
    { value: "tasks", label: "Tasks", icon: CheckSquare },
    { value: "notes", label: "Notes", icon: FileText },
    { value: "materials", label: "Materials", icon: Archive },
    { value: "progress", label: "Progress", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <PageHeader
        breadcrumbs={[...breadcrumbs, { label: classData.name }]}
        title={classData.name}
      />

      {/* Badges + description */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-sm bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
            {classData.code}
          </span>
          <StatusBadge status={classData.status} />
          <span className="rounded-sm bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
            {classData.category}
          </span>
          <span className="rounded-sm bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
            {classData.level}
          </span>
        </div>

        <p className="text-sm leading-6 text-[var(--color-text-muted)]">
          {classData.description || "-"}
        </p>
      </div>

      <StatsGrid
        columns={4}
        items={[
          { title: "Meetings", value: meetings.length, description: "Total pertemuan", icon: Calendar, tone: "purple" },
          { title: "Mentees", value: mentees.length, description: "Terdaftar", icon: Users, tone: "green" },
          { title: "Tasks", value: tasks.length, description: "Dibuat", icon: CheckSquare, tone: "orange" },
          { title: "Materials", value: materials.length, description: "Tersedia", icon: FileText, tone: "blue" },
        ]}
      />

      <div className="flex gap-2">
        <Link to={`/classes/edit/${classData.id}`}>
          <Button variant="info" size="sm">
            <Edit2 size={14} />
            Edit
          </Button>
        </Link>

        <Button variant="danger" size="sm" onClick={handleDeleteClass}>
          <Trash2 size={14} />
          Delete
        </Button>
      </div>

      <TabHeader tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <TabContent activeTab={activeTab} value="overview">
        <div className="space-y-4">
          {/* Mentor / Created By / Start Date / End Date */}
          <div className="grid grid-cols-2 gap-4 rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4 text-sm md:grid-cols-4">
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Mentor</p>
              <p className="mt-1 font-medium">{classData.mentor?.name || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Created By</p>
              <p className="mt-1 font-medium">{classData.creator?.name || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Start Date</p>
              <p className="mt-1">{formatDate(classData.startDate)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">End Date</p>
              <p className="mt-1">{formatDate(classData.endDate)}</p>
            </div>
          </div>

          <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
            <h3 className="mb-3 text-base font-semibold">Class Activity</h3>

            <div className="space-y-3">
              {activity.length === 0 && (
                <p className="text-xs text-[var(--color-text-muted)]">No recent activity.</p>
              )}

              {activity.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.tone}`}>
                    <item.icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{item.text}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{formatDate(item.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DonutCard title="Materials Overview" total={materials.length} data={materialTypeData} />
        </div>
      </TabContent>

      <TabContent activeTab={activeTab} value="meetings">
        <div className="overflow-hidden rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
          <Table
            columns={[
              { key: "meetingNumber", label: "#" },
              { key: "name", label: "Meeting" },
              {
                key: "meetingDate",
                label: "Date",
                render: (row) => formatDate(row.meetingDate),
              },
              {
                key: "status",
                label: "Status",
                render: (row) => (
                  <StatusBadge status={isPastMeeting(row) ? "Completed" : "Active"}>
                    {isPastMeeting(row) ? "Completed" : "Upcoming"}
                  </StatusBadge>
                ),
              },
              {
                key: "actions",
                label: "Actions",
                render: (row) => (
                  <Link
                    to={`/meetings/${row.id}`}
                    className="inline-flex items-center gap-1 rounded-sm bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                  >
                    <Eye size={14} />
                    View
                  </Link>
                ),
              },
            ]}
            data={sortedMeetings}
          />
        </div>
      </TabContent>

      <TabContent activeTab={activeTab} value="mentees">
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={handleOpenEnroll}>
              <UserPlus size={14} />
              Add Mentee
            </Button>
          </div>

          <div className="overflow-hidden rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
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
                { key: "email", label: "Email" },
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) => (
                    <div className="flex gap-2">
                      <Link
                        to={`/mentees/${row.id}`}
                        className="flex items-center gap-1 rounded-sm bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700 hover:bg-sky-200"
                      >
                        <Eye size={14} />
                        Details
                      </Link>
                      <button
                        onClick={() => handleRemoveMentee(row)}
                        className="flex items-center gap-1 rounded-sm bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  ),
                },
              ]}
              data={mentees}
            />
          </div>
        </div>
      </TabContent>

      <TabContent activeTab={activeTab} value="tasks">
        <div className="overflow-hidden rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
          <Table
            columns={[
              { key: "name", label: "Task" },
              { key: "maxScore", label: "Max Score" },
              {
                key: "dueDate",
                label: "Due Date",
                render: (row) => formatDate(row.dueDate),
              },
              {
                key: "status",
                label: "Status",
                render: (row) => <StatusBadge status={row.status} />,
              },
              {
                key: "actions",
                label: "Actions",
                render: (row) => (
                  <Link
                    to={`/tasks/${row.id}`}
                    className="inline-flex items-center gap-1 rounded-sm bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                  >
                    <Eye size={14} />
                    View
                  </Link>
                ),
              },
            ]}
            data={tasks}
          />
        </div>
      </TabContent>

      <TabContent activeTab={activeTab} value="notes">
        <div className="overflow-hidden rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
          <Table
            columns={[
              { key: "name", label: "Note" },
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
                      <Download size={12} />
                      Download
                    </a>
                  ) : (
                    "-"
                  ),
              },
            ]}
            data={notes}
          />
        </div>
      </TabContent>

      <TabContent activeTab={activeTab} value="materials">
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
                      <Download size={12} />
                      Download
                    </a>
                  ) : (
                    "-"
                  ),
              },
            ]}
            data={materials}
          />
        </div>
      </TabContent>

      <TabContent activeTab={activeTab} value="progress">
        <div className="space-y-4">
          <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
            <h3 className="mb-4 text-base font-semibold">Class Progress</h3>

            {chartData.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="%" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Meetings" stroke="#a855f7" strokeWidth={2} />
                  <Line type="monotone" dataKey="Tasks" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-10 text-center text-sm text-[var(--color-text-muted)]">
                No meetings yet to chart progress.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DonutCard title="Task Overview" total={tasks.length} data={taskStatusData} />
            <DonutCard title="Materials Overview" total={materials.length} data={materialTypeData} />
          </div>
        </div>
      </TabContent>

      <PopUp
        open={openEnrollPopup}
        onClose={() => setOpenEnrollPopup(false)}
        title="Add Mentees"
        width="max-w-xl"
      >
        <div className="space-y-3">
          {availableMentees.length === 0 && (
            <p className="text-sm text-[var(--color-text-muted)]">
              No available mentees to add.
            </p>
          )}

          {availableMentees.map((mentee) => (
            <label
              key={mentee.id}
              className="flex items-center gap-3 rounded-sm border border-gray-200 p-3"
            >
              <input
                type="checkbox"
                checked={selectedMentees.includes(mentee.id)}
                onChange={() => toggleMentee(mentee.id)}
              />
              <Avatar name={mentee.name} size="xs" />
              <div>
                <p className="font-medium">{mentee.name}</p>
                <p className="text-sm text-gray-500">{mentee.email}</p>
              </div>
            </label>
          ))}

          <div className="flex items-center justify-between pt-4">
            <span className="text-sm text-gray-500">
              Selected: {selectedMentees.length}
            </span>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpenEnrollPopup(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignMentees}>Add Mentees</Button>
            </div>
          </div>
        </div>
      </PopUp>
    </div>
  );
};

const DonutCard = ({ title, total, data }) => (
  <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
    <h3 className="mb-3 text-base font-semibold">{title}</h3>

    {total === 0 ? (
      <p className="py-10 text-center text-sm text-[var(--color-text-muted)]">
        No data yet.
      </p>
    ) : (
      <div className="flex items-center gap-4">
        <div className="relative h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold">{total}</span>
            <span className="text-[10px] text-[var(--color-text-muted)]">Total</span>
          </div>
        </div>

        <div className="flex-1 space-y-2 text-sm">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                />
                {entry.name}
              </span>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default Detail;
