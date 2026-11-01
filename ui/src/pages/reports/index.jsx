import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Award,
  BookOpen,
  CalendarRange,
  CheckSquare,
  Filter,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import PageHeader from "@/components/ui/page/PageHeader";
import LoadingPage from "@/components/ui/loading/LoadingPage";
import StatsGrid from "@/components/ui/cards/StatsGrid";
import ClassService from "@/services/modules/class.service";
import ReportsService from "@/services/modules/reports.service";
import useBreadcrumbs from "@/hooks/useBreadcrumbs";

const COLORS = ["#f97316", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444"];
const initialFilters = { ClassId: "", status: "All", startDate: "", endDate: "" };

const Panel = ({ children, className = "" }) => (
  <section className={`rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4 sm:p-5 ${className}`}>
    {children}
  </section>
);

const PanelTitle = ({ children, detail }) => (
  <div className="mb-4">
    <h2 className="text-base font-semibold text-[var(--color-text)]">{children}</h2>
    {detail && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{detail}</p>}
  </div>
);

const EmptyState = ({ children }) => (
  <p className="py-10 text-center text-sm text-[var(--color-text-muted)]">{children}</p>
);

const Reports = () => {
  const breadcrumbs = useBreadcrumbs();
  const [data, setData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (params, isRefresh = false) => {
    setError("");
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const requestParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value && value !== "All"),
      );
      const response = await ReportsService.getDashboard(requestParams);
      setData(response.data);
    } catch (requestError) {
      setError(requestError.message || "Analytics data could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      const [, classesResult] = await Promise.allSettled([
        loadDashboard(initialFilters),
        ClassService.getAll(),
      ]);

      if (classesResult.status === "fulfilled") {
        setClasses(classesResult.value.data || []);
      }
    };

    loadInitialData();
  }, [loadDashboard]);

  const submitFilters = (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
    loadDashboard(filters, true);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    loadDashboard(initialFilters, true);
  };

  const stats = useMemo(() => {
    if (!data?.stats) return [];
    return [
      { title: "Active Classes", value: data.stats.activeClasses, description: "In selected scope", icon: BookOpen, tone: "orange" },
      { title: "People in Scope", value: data.stats.totalUsers, description: "Analytics population", icon: Users, tone: "blue" },
      { title: "Task Completion", value: `${data.stats.taskCompletionRate}%`, description: "Submitted task slots", icon: CheckSquare, tone: "green" },
      { title: "Attendance", value: `${data.stats.avgAttendance}%`, description: "Present and late records", icon: CalendarRange, tone: "amber" },
      { title: "Average Score", value: data.stats.avgAssessmentScore, description: "Published assessments", icon: Award, tone: "purple" },
    ];
  }, [data]);

  const classOptions = useMemo(
    () => classes.map((item) => ({ value: String(item.id), label: item.name })),
    [classes],
  );
  const activeFilterCount = Object.values(appliedFilters).filter((value) => value && value !== "All").length;

  if (loading) return <LoadingPage title="Loading analytics dashboard..." />;

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="Analytics"
        description="Track learning progress, engagement, and assessment outcomes in one operational view."
        actions={(
          <button
            type="button"
            onClick={() => loadDashboard(appliedFilters, true)}
            disabled={refreshing}
            title="Refresh analytics"
            className="inline-flex h-9 items-center justify-center rounded-sm border border-gray-300 bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            <span className="ml-2">Refresh</span>
          </button>
        )}
      />

      <Panel>
        <form onSubmit={submitFilters} className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Class</span>
            <select value={filters.ClassId} onChange={(event) => setFilters((current) => ({ ...current, ClassId: event.target.value }))} className="h-10 w-full rounded-sm border border-gray-300 bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-orange-500">
              <option value="">All classes</option>
              {classOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Status</span>
            <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="h-10 w-full rounded-sm border border-gray-300 bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-orange-500">
              <option value="All">All statuses</option><option value="Active">Active</option><option value="Completed">Completed</option><option value="Archived">Archived</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">From</span>
            <input type="date" value={filters.startDate} onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))} className="h-10 w-full rounded-sm border border-gray-300 bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-orange-500" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[var(--color-text-muted)]">Until</span>
            <input type="date" value={filters.endDate} onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))} className="h-10 w-full rounded-sm border border-gray-300 bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-orange-500" />
          </label>
          <div className="flex items-end gap-2">
            <button type="submit" className="inline-flex h-10 flex-1 items-center justify-center rounded-sm bg-orange-600 px-3 text-sm font-medium text-white transition-colors hover:bg-orange-700"><Filter size={16} /><span className="ml-2">Apply</span></button>
            <button type="button" onClick={resetFilters} className="h-10 rounded-sm border border-gray-300 px-3 text-sm font-medium text-[var(--color-text)] hover:bg-gray-50">Reset</button>
          </div>
        </form>
      </Panel>

      {error ? (
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3"><AlertTriangle size={20} className="mt-0.5 text-red-600" /><div><h2 className="text-sm font-semibold text-[var(--color-text)]">Analytics unavailable</h2><p className="mt-1 text-sm text-[var(--color-text-muted)]">{error}</p></div></div>
            <button type="button" onClick={() => loadDashboard(appliedFilters, true)} className="rounded-sm border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50">Try again</button>
          </div>
        </Panel>
      ) : data ? (
        <>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]"><TrendingUp size={14} className="text-orange-600" /><span>{data.scope === "Mentor" ? "Your assigned classes" : "Organization analytics"}</span>{activeFilterCount > 0 && <span className="rounded-sm bg-orange-100 px-2 py-0.5 font-medium text-orange-700">{activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active</span>}</div>
          <StatsGrid items={stats} columns={5} />

          <div className="grid gap-5 xl:grid-cols-3">
            <Panel className="xl:col-span-2"><PanelTitle detail="Six-month view of users in the active analytics scope">Learner Growth</PanelTitle>{data.userGrowth?.length ? <ResponsiveContainer width="100%" height={280}><LineChart data={data.userGrowth} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}><CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Line type="monotone" dataKey="activeUsers" name="Active users" stroke="#f97316" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="mentees" name="Mentees" stroke="#0ea5e9" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer> : <EmptyState>No user growth data in this scope.</EmptyState>}</Panel>
            <Panel><PanelTitle detail="Published assessment results">Score Distribution</PanelTitle>{data.scoreDistribution?.some((item) => item.count > 0) ? <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={data.scoreDistribution} dataKey="count" nameKey="range" innerRadius={56} outerRadius={84} paddingAngle={2}>{data.scoreDistribution.map((item, index) => <Cell key={item.range} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend iconSize={9} wrapperStyle={{ fontSize: 11 }} /></PieChart></ResponsiveContainer> : <EmptyState>No scored assessments yet.</EmptyState>}</Panel>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <Panel className="xl:col-span-2"><PanelTitle detail="Attendance, task completion, and average score by class">Class Performance</PanelTitle>{data.classPerformance?.length ? <ResponsiveContainer width="100%" height={300}><BarChart data={data.classPerformance} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}><CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-16} textAnchor="end" height={54} /><YAxis domain={[0, 100]} tick={{ fontSize: 12 }} /><Tooltip /><Legend /><Bar dataKey="attendance" name="Attendance" fill="#0ea5e9" radius={[2, 2, 0, 0]} /><Bar dataKey="tasks" name="Tasks" fill="#22c55e" radius={[2, 2, 0, 0]} /><Bar dataKey="avgScore" name="Average score" fill="#f97316" radius={[2, 2, 0, 0]} /></BarChart></ResponsiveContainer> : <EmptyState>No classes match the selected filters.</EmptyState>}</Panel>
            <Panel><PanelTitle detail="Work awaiting follow-up">Needs Attention</PanelTitle>{data.needsAttentionAlerts?.length ? <div className="space-y-3">{data.needsAttentionAlerts.map((alert) => <div key={alert.message} className="border-l-2 border-amber-500 bg-amber-50 p-3"><p className="text-sm font-medium text-amber-900">{alert.message}</p><p className="mt-1 text-xs text-amber-800">{alert.detail}</p></div>)}</div> : <EmptyState>No follow-up is needed.</EmptyState>}</Panel>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <Panel className="overflow-x-auto xl:col-span-2"><PanelTitle detail="Compare performance without leaving the dashboard">Class Details</PanelTitle>{data.classPerformance?.length ? <table className="min-w-[680px] w-full text-left text-sm"><thead className="border-b border-gray-200 text-xs uppercase text-[var(--color-text-muted)]"><tr><th className="pb-3 font-medium">Class</th><th className="pb-3 font-medium">Mentees</th><th className="pb-3 font-medium">Attendance</th><th className="pb-3 font-medium">Tasks</th><th className="pb-3 font-medium">Score</th><th className="pb-3 font-medium">Progress</th></tr></thead><tbody className="divide-y divide-gray-100">{data.classPerformance.map((item) => <tr key={item.id} className="hover:bg-gray-50"><td className="py-3 font-medium text-[var(--color-text)]">{item.name}</td><td className="py-3">{item.mentees}</td><td className="py-3">{item.attendance}%</td><td className="py-3">{item.tasks}%</td><td className="py-3">{item.avgScore}</td><td className="py-3"><div className="flex items-center gap-2"><div className="h-1.5 w-20 bg-gray-100"><div className="h-full bg-orange-500" style={{ width: `${Math.min(item.progress, 100)}%` }} /></div><span>{item.progress}%</span></div></td></tr>)}</tbody></table> : <EmptyState>No class data is available.</EmptyState>}</Panel>
            <Panel><PanelTitle detail="Current assessment delivery">Task & Assessment</PanelTitle><dl className="space-y-3 text-sm">{[["Task slots", data.taskStatistics?.total], ["Submitted", data.taskStatistics?.submitted], ["Pending review", data.taskStatistics?.pending], ["Reviewed", data.taskStatistics?.reviewed], ["Overdue", data.taskStatistics?.overdue]].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-gray-100 pb-2"><dt className="text-[var(--color-text-muted)]">{label}</dt><dd className="font-semibold text-[var(--color-text)]">{value ?? 0}</dd></div>)}</dl><div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-center"><div><p className="text-xl font-bold text-orange-600">{data.assessmentOverview?.averageScore ?? 0}</p><p className="text-xs text-[var(--color-text-muted)]">Average score</p></div><div><p className="text-xl font-bold text-green-600">{data.assessmentOverview?.passRate ?? 0}%</p><p className="text-xs text-[var(--color-text-muted)]">Pass rate</p></div></div></Panel>
          </div>
        </>
      ) : <EmptyState>No analytics data is available.</EmptyState>}
    </div>
  );
};

export default Reports;
