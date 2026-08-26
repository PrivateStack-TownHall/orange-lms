import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";

import MeetingService from "@/services/modules/meeting.service";
import AttendanceService from "@/services/modules/attendance.service";
import useBreadcrumbs from "@/hooks/useBreadcrumbs";

import {
  Calendar,
  CheckSquare,
  FileText,
  Archive,
  Download,
  Eye,
  Upload,
} from "lucide-react";

import { formatDate } from "@/helpers";

import SubmitTaskModal from "./components/SubmitTaskModal";

const tabs = ["Tasks", "Notes", "Materials", "Attendance"];

const Mentee = () => {
  const { id } = useParams();
  const breadcrumbs = useBreadcrumbs([
    {
      label: "Meetings",
      to: "/meetings",
    },
  ]);
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("Tasks");

  const fetchMeeting = async () => {
    try {
      setLoading(true);

      const res = await MeetingService.getById(id);

      setMeeting(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeeting();
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-sm border border-gray-200 bg-white p-6">
        Loading meeting...
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="rounded-sm border border-red-200 bg-red-50 p-6 text-red-600">
        Meeting not found
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">
        {breadcrumbs.map((b, i) => (
          <span key={b.to}>
            {b.label}
            {i < breadcrumbs.length - 1 && " / "}
          </span>
        ))}

        <span className="font-medium text-gray-700">
          {" / "}
          {meeting.name}
        </span>
      </div>

      {/* Content */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left */}
        <div className="space-y-5 lg:col-span-4">
          <Hero meeting={meeting} />

          <Statistics meeting={meeting} />
        </div>

        {/* Right */}
        <div className="space-y-5 lg:col-span-8">
          <TabsHeader activeTab={activeTab} setActiveTab={setActiveTab} />

          <TabsContent activeTab={activeTab} meeting={meeting} onRefresh={fetchMeeting} />
        </div>
      </div>
    </div>
  );
};

export default Mentee;

const Hero = ({ meeting }) => {
  return (
    <div className="rounded-sm border border-gray-200 bg-white p-6">
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="rounded-sm bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
          Meeting #{meeting.meetingNumber}
        </span>

        <span className="rounded-sm bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
          {meeting.class?.code}
        </span>
      </div>

      <h1 className="text-2xl font-bold">{meeting.name}</h1>

      <p className="mt-3 text-sm text-gray-600">{meeting.description}</p>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500">Class</p>
          <p className="font-medium">{meeting.class?.name}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Date</p>
          <p className="font-medium">{formatDate(meeting.meetingDate)}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Start</p>
          <p className="font-medium">{meeting.startHour}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Finish</p>
          <p className="font-medium">{meeting.finishHour}</p>
        </div>
      </div>
    </div>
  );
};

const Statistics = ({ meeting }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StatCard
        icon={<CheckSquare size={20} />}
        label="Tasks"
        value={meeting.tasks?.length || 0}
      />

      <StatCard
        icon={<FileText size={20} />}
        label="Notes"
        value={meeting.notes?.length || 0}
      />

      <StatCard
        icon={<Archive size={20} />}
        label="Materials"
        value={meeting.materials?.length || 0}
      />
    </div>
  );
};

const StatCard = ({ icon, label, value }) => {
  return (
    <div className="rounded-sm border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        {icon}
        <span className="text-2xl font-bold">{value}</span>
      </div>

      <p className="mt-2 text-sm text-gray-500">{label}</p>
    </div>
  );
};

const TabsHeader = ({ activeTab, setActiveTab }) => {
  const icons = {
    Tasks: CheckSquare,
    Notes: FileText,
    Materials: Archive,
    Attendance: Calendar,
  };

  return (
    <div className="rounded-sm border border-gray-200 bg-white px-5">
      <div className="flex flex-wrap gap-6">
        {tabs.map((tab) => {
          const Icon = icons[tab];

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 py-4 text-sm font-medium ${
                activeTab === tab
                  ? "border-b-2 border-orange-500 text-orange-600"
                  : "text-gray-500"
              }`}
            >
              <Icon size={16} />
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TabsContent = ({ activeTab, meeting, onRefresh }) => {
  const [submittingTask, setSubmittingTask] = useState(null);

  return (
    <div className="rounded-sm border border-gray-200 bg-white p-5">
      {activeTab === "Tasks" && (
        <div className="space-y-4">
          {meeting.tasks?.length > 0 ? (
            meeting.tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-sm border border-gray-200 p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-semibold">{task.name}</h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {task.description}
                    </p>

                    <p className="mt-2 text-xs text-gray-500">
                      Due Date: {formatDate(task.dueDate)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button className="flex items-center gap-1 rounded-sm bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700 hover:bg-sky-200">
                      <Download size={16} />
                      Download
                    </button>

                    <Link
                      to={`/tasks/${task.id}`}
                      className="flex items-center gap-1 rounded-sm bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700 hover:bg-sky-200"
                    >
                      <Eye size={16} />
                      View
                    </Link>

                    <button
                      onClick={() => setSubmittingTask(task)}
                      className="flex items-center gap-2 rounded-sm bg-orange-500 px-3 py-2 text-sm text-white"
                    >
                      <Upload size={16} />
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState text="No tasks available" />
          )}
        </div>
      )}

      {activeTab === "Notes" && (
        <div className="space-y-4">
          {meeting.notes?.length > 0 ? (
            meeting.notes.map((note) => (
              <div
                key={note.id}
                className="rounded-sm border border-gray-200 p-4"
              >
                <h3 className="font-semibold">{note.name}</h3>

                <p className="mt-2 text-sm text-gray-500">{note.description}</p>

                <div className="mt-4 flex gap-2">
                  <button className="flex items-center gap-1 rounded-sm bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700 hover:bg-sky-200">
                    <Eye size={16} />
                    View
                  </button>

                  <button
                    c
                    className="flex items-center gap-1 rounded-sm bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700 hover:bg-sky-200"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState text="No notes available" />
          )}
        </div>
      )}

      {activeTab === "Materials" && (
        <div className="space-y-4">
          {meeting.materials?.length > 0 ? (
            meeting.materials.map((material) => (
              <div
                key={material.id}
                className="rounded-sm border border-gray-200 p-4"
              >
                <h3 className="font-semibold">{material.name}</h3>

                <p className="mt-1 text-sm text-gray-500">{material.type}</p>

                <p className="mt-2 text-sm text-gray-500">
                  {material.description}
                </p>

                <div className="mt-4 flex gap-2">
                  <button className="flex items-center gap-1 rounded-sm bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700 hover:bg-sky-200">
                    <Eye size={16} />
                    View
                  </button>

                  <button className="flex items-center gap-1 rounded-sm bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700 hover:bg-sky-200">
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState text="No materials available" />
          )}
        </div>
      )}

      {activeTab === "Attendance" && (
        <MenteeAttendanceView meetingId={meeting.id} />
      )}

      <SubmitTaskModal
        open={!!submittingTask}
        task={submittingTask}
        onClose={() => setSubmittingTask(null)}
        onSubmitted={onRefresh}
      />
    </div>
  );
};

const MenteeAttendanceView = ({ meetingId }) => {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await AttendanceService.getByMeeting(meetingId);
        const mine = (res.data || []).find((r) => r.UserId === user?.id);
        setRecord(mine || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (meetingId) fetchAttendance();
  }, [meetingId, user?.id]);

  if (loading) {
    return (
      <p className="py-6 text-center text-sm text-gray-500">
        Loading attendance...
      </p>
    );
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center rounded-sm border border-dashed border-gray-300 p-8 text-center">
        <img
          src="/class-reminder-bell-calendar.png"
          alt=""
          className="h-16 w-16 object-contain opacity-70"
        />
        <p className="mt-3 text-sm text-gray-500">
          Your attendance for this meeting hasn't been recorded yet.
        </p>
      </div>
    );
  }

  const STATUS_STYLE = {
    Present: "bg-green-100 text-green-700",
    Late: "bg-orange-100 text-orange-700",
    Absent: "bg-red-100 text-red-700",
    Excused: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="rounded-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Your Status</p>
          <span
            className={`mt-1 inline-block rounded-sm px-3 py-1 text-sm font-semibold ${STATUS_STYLE[record.status] || "bg-gray-100 text-gray-600"}`}
          >
            {record.status}
          </span>
        </div>
        {record.checkInAt && (
          <div className="text-right">
            <p className="text-sm text-gray-500">Check-in Time</p>
            <p className="font-medium">
              {new Date(record.checkInAt).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
      {record.notes && (
        <p className="mt-3 text-sm text-gray-600">Notes: {record.notes}</p>
      )}
    </div>
  );
};

const EmptyState = ({ text }) => {
  return (
    <div className="rounded-sm border border-dashed border-gray-300 p-8 text-center text-gray-500">
      {text}
    </div>
  );
};
