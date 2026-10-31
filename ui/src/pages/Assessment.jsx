import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Award,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Star,
  Users,
} from "lucide-react";

import usePopupStore from "@/app/store/popupStore";
import AssessmentResultService from "@/services/modules/assessmentResult.service";
import { useBreadcrumbs, usePagination, useSearch } from "@/hooks";
import PageHeader from "@/components/ui/page/PageHeader";
import StatsGrid from "@/components/ui/cards/StatsGrid";
import Table from "@/components/ui/tables/Table";
import TableControls from "@/components/ui/tables/TableControls";
import Pagination from "@/components/ui/tables/Pagination";
import LoadingPage from "@/components/ui/loading/LoadingPage";
import Avatar from "@/components/ui/avatar/Avatar";

const performance = (score) => {
  if (Number(score) >= 90) return { label: "Excellent", tone: "bg-green-100 text-green-700" };
  if (Number(score) >= 70) return { label: "On Track", tone: "bg-blue-100 text-blue-700" };
  return { label: "Needs Help", tone: "bg-red-100 text-red-700" };
};

const Assessment = () => {
  const breadcrumbs = useBreadcrumbs();
  const role = useSelector((state) => state.auth.user?.role);
  const { openError } = usePopupStore();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState("");
  const [meetingFilter, setMeetingFilter] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await AssessmentResultService.getAll();
        setResults(response.data || []);
      } catch (error) {
        openError({
          title: "Load Failed",
          message: error?.response?.data?.message || "Failed to load assessments.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [openError]);

  const searchableResults = useMemo(
    () => results.map((result) => ({
      ...result,
      search: [
        result.TaskSubmission?.User?.name,
        result.TaskSubmission?.Task?.name,
        result.TaskSubmission?.Task?.Class?.name,
        result.TaskSubmission?.Task?.Meeting?.name,
      ].filter(Boolean).join(" "),
    })),
    [results],
  );

  const { query, setQuery, searchedData } = useSearch(searchableResults, ["search"]);

  const classOptions = useMemo(
    () => Array.from(new Map(
      results
        .filter((result) => result.TaskSubmission?.Task?.Class)
        .map((result) => [
          result.TaskSubmission.Task.Class.id,
          {
            value: String(result.TaskSubmission.Task.Class.id),
            label: result.TaskSubmission.Task.Class.name,
          },
        ]),
    ).values()),
    [results],
  );

  const meetingOptions = useMemo(
    () => Array.from(new Map(
      results
        .filter((result) => result.TaskSubmission?.Task?.Meeting)
        .map((result) => [
          result.TaskSubmission.Task.Meeting.id,
          {
            value: String(result.TaskSubmission.Task.Meeting.id),
            label: result.TaskSubmission.Task.Meeting.name,
          },
        ]),
    ).values()),
    [results],
  );

  const filteredResults = useMemo(
    () => searchedData.filter((result) => {
      const task = result.TaskSubmission?.Task;
      return (
        (!classFilter || String(task?.Class?.id) === classFilter) &&
        (!meetingFilter || String(task?.Meeting?.id) === meetingFilter)
      );
    }),
    [searchedData, classFilter, meetingFilter],
  );

  const scores = useMemo(
    () => filteredResults.map((result) => Number(result.finalScore || 0)),
    [filteredResults],
  );

  const stats = useMemo(() => {
    const average = scores.reduce((sum, score) => sum + score, 0) / (scores.length || 1);
    const highest = scores.length ? Math.max(...scores) : 0;
    const passRate = scores.length
      ? Math.round((scores.filter((score) => score >= 70).length / scores.length) * 100)
      : 0;

    return [
      { title: "Assessments", value: filteredResults.length, description: "Published results", icon: ClipboardCheck, tone: "blue" },
      { title: "Average Score", value: average.toFixed(1), description: "Out of 100", icon: Users, tone: "green" },
      { title: "Highest Score", value: highest, description: "Current filters", icon: Star, tone: "orange" },
      { title: "Needs Attention", value: scores.filter((score) => score < 70).length, description: "Below 70", icon: CircleAlert, tone: "red" },
      { title: "Pass Rate", value: `${passRate}%`, description: "Score at least 70", icon: CheckCircle2, tone: "purple" },
    ];
  }, [filteredResults.length, scores]);

  const scoreDistribution = useMemo(() => {
    const bands = [
      { label: "90 - 100", min: 90, max: 100, tone: "bg-green-500" },
      { label: "80 - 89", min: 80, max: 89, tone: "bg-blue-500" },
      { label: "70 - 79", min: 70, max: 79, tone: "bg-purple-500" },
      { label: "60 - 69", min: 60, max: 69, tone: "bg-amber-500" },
      { label: "< 60", min: 0, max: 59, tone: "bg-red-500" },
    ];

    return bands.map((band) => ({
      ...band,
      count: scores.filter(
        (score) => score >= band.min && score <= band.max,
      ).length,
    }));
  }, [scores]);

  const {
    paginatedData,
    currentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(filteredResults);

  const columns = [
    {
      key: "mentee",
      label: role === "Mentee" ? "Result" : "Mentee",
      render: (result) => (
        <div className="flex items-center gap-2">
          <Avatar name={result.TaskSubmission?.User?.name} size="xs" />
          <div>
            <p className="font-medium">{result.TaskSubmission?.User?.name || "-"}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {result.TaskSubmission?.User?.email || "-"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "task",
      label: "Task",
      render: (result) => (
        <div>
          <p className="font-medium">{result.TaskSubmission?.Task?.name || "-"}</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {result.TaskSubmission?.Task?.Class?.name || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "score",
      label: "Score",
      render: (result) => <span className="font-semibold">{result.finalScore ?? 0}</span>,
    },
    {
      key: "status",
      label: "Performance",
      render: (result) => {
        const status = performance(result.finalScore);
        return <span className={`rounded-sm px-2 py-1 text-xs font-medium ${status.tone}`}>{status.label}</span>;
      },
    },
    {
      key: "gradedAt",
      label: "Graded",
      render: (result) => result.gradedAt ? new Date(result.gradedAt).toLocaleDateString("id-ID") : "-",
    },
    {
      key: "actions",
      label: "Actions",
      render: (result) => (
        <Link
          to={`/assessments/${result.id}`}
          className="rounded-sm border border-gray-200 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50"
        >
          View Result
        </Link>
      ),
    },
  ];

  if (loading) return <LoadingPage title="Loading Assessments..." />;

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <PageHeader
          breadcrumbs={breadcrumbs}
          title={role === "Mentee" ? "My Assessments" : "Assessment Overview"}
          description="Monitor submitted work and assessment outcomes."
        />
        <div className="w-full shrink-0 xl:w-[920px]">
          <StatsGrid items={stats} columns={5} compact />
        </div>
      </div>

      <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
        <TableControls
          searchQuery={query}
          setSearchQuery={setQuery}
          searchPlaceholder="Search mentee, class, meeting, or task..."
          filters={[
            { key: "class", label: "Classes", value: classFilter, onChange: setClassFilter, options: classOptions },
            { key: "meeting", label: "Meetings", value: meetingFilter, onChange: setMeetingFilter, options: meetingOptions },
          ]}
          view="table"
          setView={() => {}}
        />
        <Table columns={columns} data={paginatedData} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5 lg:col-span-2">
          <h2 className="text-base font-semibold">Recent Assessments</h2>
          <div className="mt-3 divide-y divide-gray-100">
            {filteredResults.slice(0, 5).map((result) => (
              <Link
                key={result.id}
                to={`/assessments/${result.id}`}
                className="flex items-center justify-between gap-3 py-3 hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium">
                    {result.TaskSubmission?.Task?.name || "-"}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {result.TaskSubmission?.User?.name || "-"} · {result.TaskSubmission?.Task?.Class?.name || "-"}
                  </p>
                </div>
                <span className="font-semibold text-[var(--color-primary)]">
                  {result.finalScore ?? 0}
                </span>
              </Link>
            ))}
            {!filteredResults.length && (
              <p className="py-6 text-center text-sm text-[var(--color-text-muted)]">
                No assessments match the current filters.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
          <h2 className="text-base font-semibold">Score Distribution</h2>
          <div className="mt-4 space-y-3">
            {scoreDistribution.map((band) => (
              <div key={band.label}>
                <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                  <span>{band.label}</span>
                  <span>{band.count}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-sm bg-gray-100">
                  <div
                    className={`h-full ${band.tone}`}
                    style={{ width: `${scores.length ? (band.count / scores.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        prevPage={prevPage}
        nextPage={nextPage}
        goToPage={goToPage}
        total={filteredResults.length}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
};

export default Assessment;
