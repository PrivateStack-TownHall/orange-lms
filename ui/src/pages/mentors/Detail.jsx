import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckSquare,
  ChevronDown,
  Mail,
  MapPin,
  Phone,
  Users,
  Edit2,
} from "lucide-react";

import usePopupStore from "@/app/store/popupStore";

import useBreadcrumbs from "@/hooks/useBreadcrumbs";

import MentorService from "@/services/modules/mentor.service";

import LoadingPage from "@/components/ui/loading/LoadingPage";

import TabHeader from "@/components/ui/tabs/TabHeader";
import StatsGrid from "@/components/ui/cards/StatsGrid";
import Avatar from "@/components/ui/avatar/Avatar";
import Button from "@/components/ui/buttons/Button";
import Breadcrumbs from "@/components/ui/page/Breadcrumbs";

const TABS = [
  { label: "Active Classes", value: "active" },
  { label: "Finished Classes", value: "finished" },
];

const isFinished = (cls) => cls.endDate && new Date(cls.endDate) < new Date();

const Detail = () => {
  const { id } = useParams();

  const breadcrumbs = useBreadcrumbs([{ label: "Mentors", to: "/mentors" }]);

  const { openConfirm, openError, openSuccess } = usePopupStore();

  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const res = await MentorService.getById(id);
        setMentor(res.data);
      } catch (error) {
        console.error(error);
        openError({
          title: "Load Failed",
          message: error?.response?.data?.message || "Failed to load mentor.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMentor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRemove = () => {
    openConfirm({
      title: "Delete Mentor",
      message:
        "Are you sure you want to delete this mentor? This action cannot be undone.",
      action: async () => {
        try {
          await MentorService.delete(id);
          openSuccess({ title: "Success", message: "Mentor deleted successfully." });
        } catch (error) {
          console.error(error);
          openError({
            title: "Delete Failed",
            message: error?.response?.data?.message || "Failed to delete mentor.",
          });
        }
      },
    });
  };

  const { activeClasses, finishedClasses, totalMeetings, totalMentees, totalTasks } =
    useMemo(() => {
      const classes = mentor?.mentoredClasses || [];
      const active = classes.filter((c) => !isFinished(c));
      const finished = classes.filter(isFinished);

      return {
        activeClasses: active,
        finishedClasses: finished,
        totalMeetings: classes.reduce((sum, c) => sum + (c.meetings?.length || 0), 0),
        totalMentees: classes.reduce((sum, c) => sum + (c.mentees?.length || 0), 0),
        totalTasks: classes.reduce((sum, c) => sum + (c.tasks?.length || 0), 0),
      };
    }, [mentor]);

  if (loading) {
    return <LoadingPage title="Loading Mentor..." />;
  }

  if (!mentor) {
    return <div className="p-4">Mentor not found.</div>;
  }

  const displayed = activeTab === "active" ? activeClasses : finishedClasses;

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <Breadcrumbs items={[...breadcrumbs, { label: mentor.name }]} />

      <Link
        to="/mentors"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
      >
        <ArrowLeft size={16} />
        Back to Mentors
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
            <div className="flex flex-col items-center text-center">
              <Avatar src={mentor.avatarUrl} name={mentor.name} size="xl" />

              <div className="mt-4 flex items-center gap-2">
                <h1 className="text-xl font-bold">{mentor.name}</h1>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    mentor.isActive ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              </div>

              <span
                className={`mt-1 rounded-sm px-2 py-1 text-xs font-medium ${
                  mentor.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}
              >
                {mentor.isActive ? "Active" : "Inactive"}
              </span>

              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <span className="rounded-sm bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                  {mentor.role}
                </span>
                <span className="rounded-sm bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                  ID: MENT-{String(mentor.id).padStart(4, "0")}
                </span>
              </div>

              <div className="mt-5 w-full space-y-2 text-left text-sm">
                <p className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <Mail size={14} /> {mentor.email}
                </p>
                <p className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <Phone size={14} /> {mentor.profile?.phoneNumber || "-"}
                </p>
                <p className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <MapPin size={14} />
                  {[mentor.profile?.address, mentor.profile?.city, mentor.profile?.country]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </p>
              </div>

              {mentor.profile?.background && (
                <div className="mt-4 w-full rounded-sm bg-gray-50 p-3 text-left">
                  <p className="text-xs font-medium text-gray-500">About</p>
                  <p className="mt-1 text-sm">{mentor.profile.background}</p>
                </div>
              )}

              <div className="mt-4 flex w-full gap-2">
                <Link to={`/mentors/edit/${mentor.id}`} className="flex-1">
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
              { title: "Total Classes", value: mentor.mentoredClasses?.length || 0, description: "Active", icon: BookOpen, tone: "purple" },
              { title: "Total Meetings", value: totalMeetings, description: "Upcoming & completed", icon: Calendar, tone: "green" },
              { title: "Total Mentees", value: totalMentees, description: "Across all classes", icon: Users, tone: "orange" },
              { title: "Tasks Created", value: totalTasks, description: "Total tasks", icon: CheckSquare, tone: "blue" },
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
              <MentorClassCard key={cls.id} cls={cls} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MentorClassCard = ({ cls }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-orange-100 text-sm font-bold text-orange-600">
            {cls.code?.slice(0, 2)}
          </div>
          <div>
            <p className="font-semibold">{cls.code}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{cls.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-sm bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
            {cls.level}
          </span>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-sm p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <ChevronDown
              size={16}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-gray-100 pt-4 text-sm">
          <div>
            <p className="text-xs text-gray-500">Period</p>
            <p className="mt-1 flex items-center gap-1.5 font-medium">
              <Calendar size={14} />
              {cls.startDate ? new Date(cls.startDate).toLocaleDateString("en", { month: "short", year: "numeric" }) : "-"} -{" "}
              {cls.endDate ? new Date(cls.endDate).toLocaleDateString("en", { month: "short", year: "numeric" }) : "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Mentees</p>
            <p className="mt-1 flex items-center gap-1.5 font-medium">
              <Users size={14} /> {cls.mentees?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Meetings</p>
            <p className="mt-1 flex items-center gap-1.5 font-medium">
              <Calendar size={14} /> {cls.meetings?.length || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Tasks</p>
            <p className="mt-1 flex items-center gap-1.5 font-medium">
              <CheckSquare size={14} /> {cls.tasks?.length || 0}
            </p>
          </div>

          <Link
            to={`/classes/${cls.id}`}
            className="ml-auto inline-flex items-center gap-1 rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
          >
            View Class
          </Link>
        </div>
      )}
    </div>
  );
};

export default Detail;
