import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import MentorService from "@/services/modules/mentor.service";

import {
  BookOpen,
  Calendar,
  CheckSquare,
  Users,
  GraduationCap,
  Clock,
  AlertCircle,
} from "lucide-react";

const MentorDashboard = () => {
  const user = useSelector((state) => state.auth.user);

  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await MentorService.getById(user?.id);

        setMentor(res.data);
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.message || "Failed to load mentor dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchMentor();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="rounded-sm border border-gray-200 bg-white p-6">
        Loading mentor dashboard...
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

  if (!mentor) {
    return (
      <div className="rounded-sm border border-gray-200 bg-white p-6">
        No mentor data found.
      </div>
    );
  }

  const classes = mentor.mentoredClasses || [];

  const totalClasses = classes.length;

  const totalMeetings = classes.reduce(
    (acc, cls) => acc + (cls.meetings?.length || 0),
    0,
  );

  const totalTasks = 0;

  const totalStudents = 0;

  const upcomingMeetings = classes.flatMap((cls) =>
    (cls.meetings || []).map((meeting) => ({
      ...meeting,
      className: cls.name,
      classCode: cls.code,
    })),
  );

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="rounded-sm border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-5">
          <img
            src={mentor.avatarUrl || "https://placehold.co/120x120?text=Mentor"}
            alt={mentor.name}
            className="h-20 w-20 rounded-sm border border-gray-200 object-cover"
          />

          <div>
            <h1 className="text-2xl font-bold">
              Welcome Back, {mentor.name} 👋
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {mentor.profile?.background || "-"}
            </p>

            <p className="text-sm text-gray-500">
              {mentor.profile?.city || "-"}
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

          <p className="mt-3 text-sm text-gray-500">My Meetings</p>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <CheckSquare size={22} className="text-green-500" />
            <span className="text-2xl font-bold">{totalTasks}</span>
          </div>

          <p className="mt-3 text-sm text-gray-500">My Tasks</p>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <Users size={22} className="text-purple-500" />
            <span className="text-2xl font-bold">{totalStudents}</span>
          </div>

          <p className="mt-3 text-sm text-gray-500">My Students</p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 gap-5 xl:grid-cols-2">
        {/* My Classes */}
        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <GraduationCap size={20} />
            <h2 className="font-semibold">My Classes</h2>
          </div>

          <div className="space-y-3">
            {classes.length === 0 ? (
              <p className="text-sm text-gray-500">No classes assigned</p>
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
                          : cls.status === "Archived"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
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

        {/* Meetings */}
        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Clock size={20} />
            <h2 className="font-semibold">Upcoming Meetings</h2>
          </div>

          <div className="space-y-3">
            {upcomingMeetings.length === 0 ? (
              <p className="text-sm text-gray-500">No meetings available</p>
            ) : (
              upcomingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="rounded-sm border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      Meeting #{meeting.meetingNumber}
                    </h3>

                    <span className="text-xs text-gray-500">
                      {meeting.startHour} - {meeting.finishHour}
                    </span>
                  </div>

                  <p className="mt-1">{meeting.name}</p>

                  <p className="mt-2 text-sm text-gray-500">
                    {meeting.className}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
