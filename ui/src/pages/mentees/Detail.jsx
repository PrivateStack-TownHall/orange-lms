import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  Mail,
  MapPin,
  Phone,
  Users,
  Edit2,
  CheckCircle2,
} from "lucide-react";

import usePopupStore from "@/app/store/popupStore";

import useBreadcrumbs from "@/hooks/useBreadcrumbs";

import MenteeService from "@/services/modules/mentee.service";
import AttendanceService from "@/services/modules/attendance.service";

import { formatDate } from "@/helpers";

import LoadingPage from "@/components/ui/loading/LoadingPage";
import TabHeader from "@/components/ui/tabs/TabHeader";
import StatsGrid from "@/components/ui/cards/StatsGrid";
import Avatar from "@/components/ui/avatar/Avatar";
import Button from "@/components/ui/buttons/Button";
import ProgressBar from "@/components/ui/progress/ProgressBar";
import Breadcrumbs from "@/components/ui/page/Breadcrumbs";

const TABS = [
  { label: "Active Classes", value: "active" },
  { label: "Finished Classes", value: "finished" },
];

const isFinished = (cls) => cls.endDate && new Date(cls.endDate) < new Date();

const Detail = () => {
  const { id } = useParams();

  const breadcrumbs = useBreadcrumbs([{ label: "Mentees", to: "/mentees" }]);

  const { openConfirm, openError, openSuccess } = usePopupStore();

  const [mentee, setMentee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const fetchMentee = async () => {
      try {
        const res = await MenteeService.getById(id);
        setMentee(res.data);
      } catch (error) {
        console.error(error);
        openError({
          title: "Load Failed",
          message: error?.response?.data?.message || "Failed to load mentee.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMentee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await AttendanceService.getByUser(id);
        setActivity(res.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchActivity();
  }, [id]);

  const handleRemove = () => {
    openConfirm({
      title: "Delete Mentee",
      message:
        "Are you sure you want to delete this mentee? This action cannot be undone.",
      action: async () => {
        try {
          await MenteeService.delete(id);
          openSuccess({ title: "Success", message: "Mentee deleted successfully." });
        } catch (error) {
          console.error(error);
          openError({
            title: "Delete Failed",
            message: error?.response?.data?.message || "Failed to delete mentee.",
          });
        }
      },
    });
  };

  const {
    activeClasses,
    finishedClasses,
    totalMeetingsAttended,
    totalTasksAvailable,
    overallProgress,
  } = useMemo(() => {
    const classes = mentee?.enrolledClasses || [];
    const active = classes.filter((c) => !isFinished(c));
    const finished = classes.filter(isFinished);

    const avgProgress = classes.length
      ? Math.round(
          classes.reduce((sum, c) => sum + Number(c.ClassUser?.progressPercentage || 0), 0) /
            classes.length,
        )
      : 0;

    return {
      activeClasses: active,
      finishedClasses: finished,
      totalMeetingsAttended: classes.reduce((sum, c) => sum + (c.meetings?.length || 0), 0),
      totalTasksAvailable: classes.reduce((sum, c) => sum + (c.tasks?.length || 0), 0),
      overallProgress: avgProgress,
    };
  }, [mentee]);

  if (loading) {
    return <LoadingPage title="Loading Mentee..." />;
  }

  if (!mentee) {
    return <div className="p-4">Mentee not found.</div>;
  }

  const displayed = activeTab === "active" ? activeClasses : finishedClasses;

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <Breadcrumbs items={[...breadcrumbs, { label: mentee.name }]} />

      <Link
        to="/mentees"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
      >
        <ArrowLeft size={16} />
        Back to Mentees
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
            <div className="flex flex-col items-center text-center">
              <Avatar src={mentee.avatarUrl} name={mentee.name} size="xl" />

              <div className="mt-4 flex items-center gap-2">
                <h1 className="text-xl font-bold">{mentee.name}</h1>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    mentee.isActive ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              </div>

              <span
                className={`mt-1 rounded-sm px-2 py-1 text-xs font-medium ${
                  mentee.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}
              >
                {mentee.isActive ? "Active" : "Inactive"}
              </span>

              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <span className="rounded-sm bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                  {mentee.role}
                </span>
                <span className="rounded-sm bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                  ID: MENTEE-{String(mentee.id).padStart(4, "0")}
                </span>
              </div>

              <div className="mt-5 w-full space-y-2 text-left text-sm">
                <p className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <Mail size={14} /> {mentee.email}
                </p>
                <p className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <Phone size={14} /> {mentee.profile?.phoneNumber || "-"}
                </p>
                <p className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <MapPin size={14} />
                  {[mentee.profile?.address, mentee.profile?.city, mentee.profile?.country]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </p>
              </div>

              {mentee.profile?.background && (
                <div className="mt-4 w-full rounded-sm bg-gray-50 p-3 text-left">
                  <p className="text-xs font-medium text-gray-500">About</p>
                  <p className="mt-1 text-sm">{mentee.profile.background}</p>
                </div>
              )}

              <div className="mt-4 flex w-full gap-2">
                <Link to={`/mentees/edit/${mentee.id}`} className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">
                    <Edit2 size={14} /> Edit Profile
                  </Button>
                </Link>
                <Button variant="danger" size="sm" onClick={handleRemove}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4 lg:col-span-3">
          <StatsGrid
            columns={4}
            items={[
              { title: "Total Classes", value: mentee.enrolledClasses?.length || 0, description: "Active", icon: BookOpen, tone: "purple" },
              { title: "Total Meetings", value: totalMeetingsAttended, description: "Attended", icon: Calendar, tone: "green" },
              { title: "Tasks Available", value: totalTasksAvailable, description: "Across classes", icon: CheckSquare, tone: "orange" },
              { title: "Overall Progress", value: `${overallProgress}%`, description: "Average", icon: Clock, tone: "blue" },
            ]}
          />

          <TabHeader tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="space-y-3">
            {displayed.length === 0 && (
              <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-text-muted)]">
                No classes found.
              </div>
            )}

            {displayed.map((cls) => (
              <div key={cls.id} className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-orange-100 text-sm font-bold text-orange-600">
                      {cls.code?.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold">{cls.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{cls.code}</p>
                    </div>
                  </div>

                  <span
                    className={`rounded-sm px-2 py-1 text-xs font-medium ${
                      cls.ClassUser?.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {cls.ClassUser?.status || "-"}
                  </span>
                </div>

                <div className="mt-4">
                  <ProgressBar value={Number(cls.ClassUser?.progressPercentage || 0)} />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-sm bg-gray-50 p-2.5 text-center">
                    <p className="text-gray-500">Mentor</p>
                    <p className="mt-1 font-semibold">{cls.mentor?.name || "-"}</p>
                  </div>
                  <div className="rounded-sm bg-gray-50 p-2.5 text-center">
                    <p className="text-gray-500">Meetings</p>
                    <p className="mt-1 font-semibold">{cls.meetings?.length || 0}</p>
                  </div>
                  <div className="rounded-sm bg-gray-50 p-2.5 text-center">
                    <p className="text-gray-500">Tasks</p>
                    <p className="mt-1 font-semibold">{cls.tasks?.length || 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
            <h3 className="mb-3 text-base font-semibold">Recent Activity</h3>

            {activity.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {activity.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-start gap-3 text-sm">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        item.status === "Present" ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      <CheckCircle2 size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate">
                        Marked <span className="font-medium">{item.status}</span> for{" "}
                        {item.Meeting?.name || "a meeting"}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {item.checkInAt ? formatDate(item.checkInAt) : "-"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
