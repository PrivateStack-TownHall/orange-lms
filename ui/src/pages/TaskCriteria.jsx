import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Award, CheckCircle2, ListChecks, Target, TriangleAlert } from "lucide-react";

import usePopupStore from "@/app/store/popupStore";
import TaskCriteriaService from "@/services/modules/taskCriteria.service";
import { useBreadcrumbs, usePagination, useSearch } from "@/hooks";
import PageHeader from "@/components/ui/page/PageHeader";
import StatsGrid from "@/components/ui/cards/StatsGrid";
import Table from "@/components/ui/tables/Table";
import TableControls from "@/components/ui/tables/TableControls";
import Pagination from "@/components/ui/tables/Pagination";
import LoadingPage from "@/components/ui/loading/LoadingPage";

const TaskCriteria = () => {
  const breadcrumbs = useBreadcrumbs();
  const { openError } = usePopupStore();
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState("");

  useEffect(() => {
    const fetchCriteria = async () => {
      try {
        const response = await TaskCriteriaService.getAll();
        setCriteria(response.data || []);
      } catch (error) {
        openError({
          title: "Load Failed",
          message: error?.response?.data?.message || "Failed to load task criteria.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCriteria();
  }, [openError]);

  const searchableCriteria = useMemo(
    () =>
      criteria.map((item) => ({
        ...item,
        search: [
          item.title,
          item.description,
          item.Task?.name,
          item.Task?.Class?.name,
          item.Task?.Class?.code,
        ].filter(Boolean).join(" "),
      })),
    [criteria],
  );

  const { query, setQuery, searchedData } = useSearch(searchableCriteria, ["search"]);

  const classOptions = useMemo(
    () => Array.from(new Map(
      criteria
        .filter((item) => item.Task?.Class)
        .map((item) => [
          item.Task.Class.id,
          { value: String(item.Task.Class.id), label: item.Task.Class.name },
        ]),
    ).values()),
    [criteria],
  );

  const filteredCriteria = useMemo(
    () => searchedData.filter(
      (item) => !classFilter || String(item.Task?.Class?.id) === classFilter,
    ),
    [searchedData, classFilter],
  );

  const taskSummaries = useMemo(() => {
    const summary = new Map();

    criteria.forEach((item) => {
      const current = summary.get(item.TaskId) || { count: 0, weight: 0 };
      current.count += 1;
      current.weight += Number(item.percentage || 0);
      summary.set(item.TaskId, current);
    });

    return [...summary.values()];
  }, [criteria]);

  const stats = useMemo(() => [
    { title: "Total Criteria", value: criteria.length, description: "Across all tasks", icon: ListChecks, tone: "blue" },
    { title: "Configured Tasks", value: taskSummaries.length, description: "Tasks with criteria", icon: Award, tone: "purple" },
    { title: "Valid Weight", value: taskSummaries.filter((item) => item.weight === 100).length, description: "Tasks ready to grade", icon: CheckCircle2, tone: "green" },
    { title: "Needs Review", value: taskSummaries.filter((item) => item.weight !== 100).length, description: "Weight is not 100%", icon: TriangleAlert, tone: "amber" },
  ], [criteria.length, taskSummaries]);

  const {
    paginatedData,
    currentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(filteredCriteria);

  const columns = [
    {
      key: "task",
      label: "Task",
      render: (item) => (
        <div>
          <p className="font-medium">{item.Task?.name || "-"}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{item.Task?.Class?.name || "-"}</p>
        </div>
      ),
    },
    {
      key: "title",
      label: "Criteria",
      render: (item) => (
        <div>
          <p className="font-medium">{item.title}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{item.description || "No description"}</p>
        </div>
      ),
    },
    { key: "percentage", label: "Weight", render: (item) => `${item.percentage}%` },
    { key: "maxScore", label: "Max Score" },
    { key: "order", label: "Order" },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <Link to={`/tasks/${item.TaskId}`} className="inline-flex items-center gap-1 rounded-sm border border-gray-200 px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50">
          <Target size={14} /> Open Task
        </Link>
      ),
    },
  ];

  if (loading) return <LoadingPage title="Loading Task Criteria..." />;

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <PageHeader breadcrumbs={breadcrumbs} title="Task Criteria" description="Review the grading criteria configured for accessible tasks." />
        <div className="w-full shrink-0 xl:w-[720px]">
          <StatsGrid items={stats} columns={4} compact />
        </div>
      </div>

      <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
        <TableControls
          searchQuery={query}
          setSearchQuery={setQuery}
          searchPlaceholder="Search task, class, or criteria..."
          filters={[{ key: "class", label: "Classes", value: classFilter, onChange: setClassFilter, options: classOptions }]}
          view="table"
          setView={() => {}}
        />
        <Table columns={columns} data={paginatedData} />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        prevPage={prevPage}
        nextPage={nextPage}
        goToPage={goToPage}
        total={filteredCriteria.length}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
};

export default TaskCriteria;
