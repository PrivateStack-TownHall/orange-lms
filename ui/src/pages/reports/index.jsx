import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  Calendar,
  CheckSquare,
  Award,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

import PageHeader from "@/components/ui/page/PageHeader";
import LoadingPage from "@/components/ui/loading/LoadingPage";

import ReportsService from "@/services/modules/reports.service";
import useBreadcrumbs from "@/hooks/useBreadcrumbs";

const StatCard = ({ icon: Icon, label, value, suffix = "" }) => (
  <div className="rounded-sm border border-gray-200 bg-white p-4">
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-orange-500" />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
    <p className="mt-1 text-xl font-bold">
      {value}
      {suffix}
    </p>
  </div>
);

const Reports = () => {
  const breadcrumbs = useBreadcrumbs();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await ReportsService.getDashboard();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingPage title="Loading reports..." />;
  if (!data) return null;

  const {
    stats,
    classPerformance,
    attendanceOverview,
    taskStatistics,
    assessmentOverview,
    scoreDistribution,
    mentorPerformance,
    menteeProgressOverview,
    menteesNeedingAttention,
    userGrowth,
    needsAttentionAlerts,
  } = data;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="Reports"
        description="Comprehensive insights and analytics across the entire LMS."
      />

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
        <StatCard
          icon={BookOpen}
          label="Active Classes"
          value={stats.activeClasses}
        />
        <StatCard
          icon={Calendar}
          label="Total Meetings"
          value={stats.totalMeetings}
        />
        <StatCard
          icon={CheckSquare}
          label="Task Completion"
          value={stats.taskCompletionRate}
          suffix="%"
        />
        <StatCard
          icon={Users}
          label="Avg. Attendance"
          value={stats.avgAttendance}
          suffix="%"
        />
        <StatCard
          icon={Award}
          label="Avg. Score"
          value={stats.avgAssessmentScore}
        />
        <StatCard
          icon={TrendingUp}
          label="Active Mentors"
          value={stats.activeMentors}
        />
      </div>

      {/* Class Performance & Attendance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-sm border border-gray-200 bg-white p-5 lg:col-span-2">
          <h3 className="mb-3 font-semibold">Class Performance</h3>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="pb-2">Class</th>
                <th className="pb-2">Mentees</th>
                <th className="pb-2">Attendance</th>
                <th className="pb-2">Tasks</th>
                <th className="pb-2">Avg Score</th>
                <th className="pb-2">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {classPerformance.map((c) => (
                <tr key={c.id}>
                  <td className="py-2 font-medium">{c.name}</td>
                  <td className="py-2">{c.mentees}</td>
                  <td className="py-2">{c.attendance}%</td>
                  <td className="py-2">{c.tasks}%</td>
                  <td className="py-2">{c.avgScore}</td>
                  <td className="py-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-orange-500"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <h3 className="mb-3 font-semibold">Attendance Overview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-green-600">Present</span>
              <span>{attendanceOverview.present}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-600">Late</span>
              <span>{attendanceOverview.late}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">Absent</span>
              <span>{attendanceOverview.absent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Excused</span>
              <span>{attendanceOverview.excused}</span>
            </div>
            <div className="mt-2 border-t border-gray-100 pt-2 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {attendanceOverview.avgAttendance}%
              </p>
              <p className="text-xs text-gray-500">Average Attendance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Task & Assessment Summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <img
              src="/grading-report-aplus.png"
              alt=""
              className="h-8 w-8 object-contain"
            />
            <h3 className="font-semibold">Task Statistics</h3>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total Tasks</span>
              <span className="font-medium">{taskStatistics.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Submitted</span>
              <span className="font-medium">{taskStatistics.submitted}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending</span>
              <span className="font-medium">{taskStatistics.pending}</span>
            </div>
            <div className="flex justify-between">
              <span>Reviewed</span>
              <span className="font-medium">{taskStatistics.reviewed}</span>
            </div>
            <div className="flex justify-between">
              <span>Overdue</span>
              <span className="font-medium text-red-600">
                {taskStatistics.overdue}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <img
              src="/goal-target-progress.png"
              alt=""
              className="h-8 w-8 object-contain"
            />
            <h3 className="font-semibold">Assessment Overview</h3>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Average Score</span>
              <span className="font-medium">
                {assessmentOverview.averageScore}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Highest Score</span>
              <span className="font-medium">
                {assessmentOverview.highestScore}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Lowest Score</span>
              <span className="font-medium">
                {assessmentOverview.lowestScore}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Pass Rate (≥70)</span>
              <span className="font-medium text-green-600">
                {assessmentOverview.passRate}%
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <h3 className="mb-3 font-semibold">Score Distribution</h3>
          <div className="space-y-2">
            {scoreDistribution.map((s) => (
              <div key={s.range}>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{s.range}</span>
                  <span>
                    {s.count} ({s.percentage}%)
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mentor Performance & Mentee Progress */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <h3 className="mb-3 font-semibold">Mentor Performance</h3>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="pb-2">Mentor</th>
                <th className="pb-2">Classes</th>
                <th className="pb-2">Meetings</th>
                <th className="pb-2">Tasks</th>
                <th className="pb-2">Attendance</th>
                <th className="pb-2">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mentorPerformance.map((m) => (
                <tr key={m.id}>
                  <td className="py-2 font-medium">{m.name}</td>
                  <td className="py-2">{m.classes}</td>
                  <td className="py-2">{m.meetings}</td>
                  <td className="py-2">{m.tasks}</td>
                  <td className="py-2">{m.attendance}%</td>
                  <td className="py-2">
                    <span
                      className={`rounded-sm px-2 py-0.5 text-xs font-medium ${
                        m.activityLevel === "High"
                          ? "bg-green-100 text-green-700"
                          : m.activityLevel === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {m.activityLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <h3 className="mb-3 font-semibold">Mentee Progress Overview</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-sm bg-green-50 p-3">
              <p className="text-xs text-gray-500">Excellent (≥85)</p>
              <p className="text-xl font-bold text-green-600">
                {menteeProgressOverview.excellent}
              </p>
            </div>
            <div className="rounded-sm bg-blue-50 p-3">
              <p className="text-xs text-gray-500">On Track (70-84)</p>
              <p className="text-xl font-bold text-blue-600">
                {menteeProgressOverview.onTrack}
              </p>
            </div>
            <div className="rounded-sm bg-amber-50 p-3">
              <p className="text-xs text-gray-500">Needs Help (50-69)</p>
              <p className="text-xl font-bold text-amber-600">
                {menteeProgressOverview.needsHelp}
              </p>
            </div>
            <div className="rounded-sm bg-red-50 p-3">
              <p className="text-xs text-gray-500">At Risk (&lt;50)</p>
              <p className="text-xl font-bold text-red-600">
                {menteeProgressOverview.atRisk}
              </p>
            </div>
          </div>

          {menteesNeedingAttention.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">
                Mentees Needing Attention
              </p>
              <div className="space-y-1">
                {menteesNeedingAttention.slice(0, 5).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-sm bg-gray-50 px-3 py-2 text-sm"
                  >
                    <span>
                      {m.name} · {m.class}
                    </span>
                    <span
                      className={`rounded-sm px-2 py-0.5 text-xs font-medium ${
                        m.status === "At Risk"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Growth & Alerts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <h3 className="mb-3 font-semibold">User Growth</h3>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="pb-2">Month</th>
                <th className="pb-2">Mentees</th>
                <th className="pb-2">Mentors</th>
                <th className="pb-2">Active Users</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {userGrowth.map((g) => (
                <tr key={g.month}>
                  <td className="py-2">{g.month}</td>
                  <td className="py-2">{g.mentees}</td>
                  <td className="py-2">{g.mentors}</td>
                  <td className="py-2 font-medium">{g.activeUsers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <h3 className="font-semibold">Needs Attention</h3>
          </div>
          {needsAttentionAlerts.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <img
                src="/deadline-warning-timer.png"
                alt=""
                className="h-14 w-14 object-contain opacity-70"
              />
              <p className="mt-2 text-sm text-gray-500">
                Nothing needs attention right now.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {needsAttentionAlerts.map((a, i) => (
                <div key={i} className="rounded-sm bg-amber-50 p-3">
                  <p className="text-sm font-medium text-amber-800">
                    {a.message}
                  </p>
                  <p className="text-xs text-amber-600">{a.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
