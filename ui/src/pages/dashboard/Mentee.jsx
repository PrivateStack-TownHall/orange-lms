import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import ClassService from "@/services/modules/class.service";

import {
  BookOpen,
  Calendar,
  CheckSquare,
  FileText,
  GraduationCap,
  Clock,
  AlertCircle,
} from "lucide-react";

const MenteeDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await ClassService.getAll();

        setClasses(res.data || []);
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.message || "Failed to load mentee dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (loading) {
    return (
      <div className="rounded-sm border border-gray-200 bg-white p-6">
        Loading mentee dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const totalClasses = classes.length;

  const totalMeetings = classes.reduce(
    (acc, cls) => acc + (cls.meetings?.length || 0),
    0,
  );

  const totalTasks = classes.reduce(
    (acc, cls) => acc + (cls.tasks?.length || 0),
    0,
  );

  const totalMaterials = classes.reduce(
    (acc, cls) => acc + (cls.materials?.length || 0),
    0,
  );

  const upcomingTasks = classes
    .flatMap((cls) =>
      (cls.tasks || []).map((task) => ({
        ...task,
        className: cls.name,
        classCode: cls.code,
      })),
    )
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const upcomingMeetings = classes
    .flatMap((cls) =>
      (cls.meetings || []).map((meeting) => ({
        ...meeting,
        className: cls.name,
        classCode: cls.code,
      })),
    )
    .sort((a, b) => new Date(a.meetingDate) - new Date(b.meetingDate));

  const todayMeeting = upcomingMeetings[0];

  const resources = classes.flatMap((cls) => [
    ...(cls.notes || []).map((note) => ({
      ...note,
      type: "Note",
    })),
    ...(cls.materials || []).map((material) => ({
      ...material,
      type: "Material",
    })),
  ]);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="rounded-sm border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatarUrl}
            alt={user?.name}
            className="h-20 w-20 rounded-sm border border-gray-200 object-cover"
          />

          <div>
            <h1 className="text-2xl font-bold">
              Welcome Back, {user?.name} 👋
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {user?.profile?.background || "-"}
            </p>

            <p className="text-sm text-gray-500">
              {user?.profile?.city || "-"}, {user?.profile?.country || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <BookOpen size={22} className="text-orange-500" />
            <span className="text-2xl font-bold">{totalClasses}</span>
          </div>

          <p className="mt-3 text-sm text-gray-500">My Classes</p>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <Calendar size={22} className="text-blue-500" />
            <span className="text-2xl font-bold">{totalMeetings}</span>
          </div>

          <p className="mt-3 text-sm text-gray-500">Meetings</p>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <CheckSquare size={22} className="text-green-500" />
            <span className="text-2xl font-bold">{totalTasks}</span>
          </div>

          <p className="mt-3 text-sm text-gray-500">Tasks</p>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <FileText size={22} className="text-purple-500" />
            <span className="text-2xl font-bold">{totalMaterials}</span>
          </div>

          <p className="mt-3 text-sm text-gray-500">Materials</p>
        </div>
      </div>

      {/* Upcoming Tasks & Today's Meeting */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <CheckSquare size={20} />
            <h2 className="font-semibold">Upcoming Tasks</h2>
          </div>

          <div className="space-y-3">
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming tasks</p>
            ) : (
              upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-sm border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{task.name}</h3>

                    <span className="text-xs text-gray-500">
                      {task.maxScore || 0} pts
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">{task.className}</p>

                  <p className="mt-1 text-xs text-gray-400">
                    Due: {task.dueDate || "-"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Clock size={20} />
            <h2 className="font-semibold">Today's Meeting</h2>
          </div>

          {!todayMeeting ? (
            <p className="text-sm text-gray-500">No meeting available</p>
          ) : (
            <div className="rounded-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Meeting #{todayMeeting.meetingNumber}
                </h3>

                <span className="text-xs text-gray-500">
                  {todayMeeting.startHour} - {todayMeeting.finishHour}
                </span>
              </div>

              <p className="mt-1">{todayMeeting.name}</p>

              <p className="mt-2 text-sm text-gray-500">
                {todayMeeting.className}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* My Classes */}
      <div className="rounded-sm border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <GraduationCap size={20} />
          <h2 className="font-semibold">My Classes</h2>
        </div>

        <div className="space-y-3">
          {classes.length === 0 ? (
            <p className="text-sm text-gray-500">No enrolled classes</p>
          ) : (
            classes.map((cls) => (
              <div
                key={cls.id}
                className="rounded-sm border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{cls.name}</h3>

                    <p className="mt-1 text-xs text-gray-500">{cls.code}</p>
                  </div>

                  <span
                    className={`rounded-sm px-2 py-1 text-xs font-medium ${
                      cls.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {cls.status}
                  </span>
                </div>

                <div className="mt-3 flex gap-4 text-sm text-gray-500">
                  <span>{cls.category}</span>
                  <span>{cls.level}</span>
                  <span>{cls.meetings?.length || 0} Meetings</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Learning Resources */}
      <div className="rounded-sm border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <FileText size={20} />
          <h2 className="font-semibold">Recent Learning Resources</h2>
        </div>

        <div className="space-y-3">
          {resources.length === 0 ? (
            <p className="text-sm text-gray-500">No resources available</p>
          ) : (
            resources.slice(0, 10).map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="rounded-sm border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{item.name}</h3>

                  <span className="rounded-sm bg-blue-100 px-2 py-1 text-xs">
                    {item.type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MenteeDashboard;
