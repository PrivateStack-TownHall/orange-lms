import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import {
  Layers,
  CheckCircle2,
  Hourglass,
  ClipboardCheck,
  Archive,
  Download,
  MoreVertical,
  Eye,
} from "lucide-react";

import usePopupStore from "@/app/store/popupStore";

import { PAGE_META } from "@/constants/pageMeta";

import { useBreadcrumbs, usePagination, useSearch, useSort } from "@/hooks";

import { can } from "@/helpers";

import TaskService from "@/services/modules/task.service";

import PageHeader from "@/components/ui/page/PageHeader";
import LoadingPage from "@/components/ui/loading/LoadingPage";
import PopUp from "@/components/ui/popup/PopUp";
import StatsGrid from "@/components/ui/cards/StatsGrid";

import Table from "@/components/ui/tables/Table";
import TableActions from "@/components/ui/tables/TableActions";
import TableControls from "@/components/ui/tables/TableControls";
import Pagination from "@/components/ui/tables/Pagination";
import EmptyTable from "@/components/ui/tables/EmptyTable";
import StatusBadge from "@/components/ui/status/StatusBadge";

import TaskDetail from "./Detail";

const SORT_OPTIONS = [
  { key: "name", label: "Task Name" },
  { key: "dueDate", label: "Due Date" },
];

const List = () => {
  const breadcrumbs = useBreadcrumbs();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("table");

  const [selectedTask, setSelectedTask] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const role = user?.role;

  const page = PAGE_META.tasks?.[role] || PAGE_META.tasks?.Admin;

  const { openConfirm, openError, openSuccess } = usePopupStore();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await TaskService.getAll();
        setData(res.data || []);
      } catch (error) {
        console.error(error);
        openError({
          title: "Load Failed",
          message: error?.response?.data?.message || "Failed to load tasks.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [openError]);

  const { query, setQuery, searchedData } = useSearch(data, [
    "name",
    "description",
    "status",
  ]);

  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const classOptions = useMemo(() => {
    const map = new Map();
    data.forEach(
      (t) =>
        t.Class &&
        map.set(t.Class.id, { label: t.Class.name, value: String(t.Class.id) }),
    );
    return Array.from(map.values());
  }, [data]);

  const filteredData = useMemo(() => {
    return searchedData.filter((row) => {
      if (classFilter && String(row.Class?.id) !== classFilter) return false;
      if (statusFilter && row.status !== statusFilter) return false;
      return true;
    });
  }, [searchedData, classFilter, statusFilter]);

  const { sortedData, sortKey, toggleSort } = useSort(filteredData);

  const {
    paginatedData,
    currentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(sortedData, view === "grid" ? 8 : 10);

  const handleRemove = (id) => {
    openConfirm({
      title: "Delete Task",
      message:
        "Are you sure you want to delete this task? This action cannot be undone.",
      action: async () => {
        try {
          await TaskService.delete(id);
          setData((prev) => prev.filter((item) => item.id !== id));
          openSuccess({
            title: "Success",
            message: "Task deleted successfully.",
          });
        } catch (error) {
          console.error(error);
          openError({
            title: "Delete Failed",
            message: error?.response?.data?.message || "Failed to delete task.",
          });
        }
      },
    });
  };

  const openTaskDetail = (row) => {
    setSelectedTask(row);
    setOpenDetail(true);
  };

  const stats = useMemo(() => {
    const total = data.length;
    const published = data.filter((t) => t.status === "Published").length;
    const draft = data.filter((t) => t.status === "Draft").length;
    const archived = data.filter((t) => t.status === "Archived").length;

    return [
      {
        title: "Total Tasks",
        value: total,
        description: "All tasks",
        icon: Layers,
        tone: "blue",
      },
      {
        title: "Published",
        value: published,
        description: "Active tasks",
        icon: CheckCircle2,
        tone: "green",
      },
      {
        title: "Draft",
        value: draft,
        description: "Not published",
        icon: Hourglass,
        tone: "amber",
      },
      {
        title: "Archived",
        value: archived,
        description: "Archived tasks",
        icon: Archive,
        tone: "purple",
      },
    ];
  }, [data]);

  const columns = [
    {
      key: "name",
      label: "Task Title",
      render: (row) => (
        <div>
          <p className="font-semibold text-[var(--color-text)]">{row.name}</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {row.description ? row.description.slice(0, 40) : "-"}
          </p>
          {row.fileUrl && (
            <a
              href={row.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 rounded-sm bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
            >
              <Download size={12} /> Download
            </a>
          )}
        </div>
      ),
    },
    {
      key: "class",
      label: "Class",
      render: (row) => (
        <div>
          <p>{row.Class?.name || "-"}</p>
          <span className="rounded-sm bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-700">
            {row.Class?.code || "-"}
          </span>
        </div>
      ),
    },
    { key: "maxScore", label: "Max Score" },
    {
      key: "dueDate",
      label: "Due Date",
      render: (row) =>
        row.dueDate ? new Date(row.dueDate).toLocaleDateString("id-ID") : "-",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "creator",
      label: "Created By",
      render: (row) => row.creator?.name || "-",
    },
    { key: "actions", label: "Actions" },
  ];

  const tableData = useMemo(
    () =>
      paginatedData.map((row) => ({
        ...row,
        actions: (
          <TableActions
            id={row.id}
            role={role}
            resource="task"
            editUrl={`/tasks/edit/${row.id}`}
            onDelete={handleRemove}
            onDetail={() => openTaskDetail(row)}
          />
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginatedData, role],
  );

  if (loading) {
    return <LoadingPage title="Loading Tasks..." />;
  }

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <PageHeader
          breadcrumbs={breadcrumbs}
          title={page.title}
          description={page.description}
        />

        <div className="w-full shrink-0 xl:w-[720px]">
          <StatsGrid items={stats} columns={4} compact />
        </div>
      </div>

      <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
        <TableControls
          searchQuery={query}
          setSearchQuery={setQuery}
          searchPlaceholder="Search tasks by title, class, or type..."
          filters={[
            {
              key: "class",
              label: "Classes",
              value: classFilter,
              onChange: setClassFilter,
              options: classOptions,
            },
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: ["Draft", "Published", "Archived"],
            },
          ]}
          sortOptions={SORT_OPTIONS}
          sortKey={sortKey}
          toggleSort={toggleSort}
          view={view}
          setView={setView}
        />
      </div>

      {view === "table" ? (
        <div className="overflow-hidden rounded-sm border border-gray-200 bg-[var(--color-surface)]">
          <div className="p-4">
            <Table columns={columns} data={tableData} />
          </div>
        </div>
      ) : (
        <TaskGrid
          data={paginatedData}
          role={role}
          onDelete={handleRemove}
          onView={openTaskDetail}
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        prevPage={prevPage}
        nextPage={nextPage}
        goToPage={goToPage}
        total={sortedData.length}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        pageSizeOptions={view === "grid" ? [8, 16, 24] : [10, 25, 50]}
      />

      <PopUp
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        title={selectedTask?.name}
      >
        <TaskDetail
          task={selectedTask}
          role={role}
          onDelete={(id) => {
            setOpenDetail(false);
            handleRemove(id);
          }}
        />
      </PopUp>
    </div>
  );
};

const TASK_ICON_TONE = [
  "bg-blue-100 text-blue-600",
  "bg-orange-100 text-orange-600",
  "bg-purple-100 text-purple-600",
  "bg-green-100 text-green-600",
];

const TaskGrid = ({ data, role, onDelete, onView }) => {
  if (!data.length) {
    return (
      <EmptyTable
        title="No Tasks Found"
        description="There are no tasks to display."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {data.map((row, index) => (
        <div
          key={row.id}
          className="flex flex-col rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4"
        >
          <div className="flex items-start justify-between">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-sm ${TASK_ICON_TONE[index % TASK_ICON_TONE.length]}`}
            >
              <ClipboardCheck size={18} />
            </div>
            <TaskGridMenu
              id={row.id}
              role={role}
              onDelete={onDelete}
              onView={() => onView(row)}
            />
          </div>

          <p className="mt-3 font-semibold text-[var(--color-text)]">
            {row.name}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {row.Class?.name || "-"}
          </p>

          <div className="mt-3">
            <StatusBadge status={row.status} />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span>
              Due{" "}
              {row.dueDate
                ? new Date(row.dueDate).toLocaleDateString("id-ID")
                : "-"}
            </span>
            {row.fileUrl && (
              <a
                href={row.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-blue-600"
              >
                <Download size={12} /> Download
              </a>
            )}
          </div>

          <button
            onClick={() => onView(row)}
            className="mt-4 inline-flex items-center justify-center gap-1 rounded-sm border border-gray-200 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <Eye size={14} /> View Task
          </button>
        </div>
      ))}
    </div>
  );
};

const TaskGridMenu = ({ id, role, onDelete, onView }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-sm p-1 text-gray-400 hover:bg-gray-100"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute right-0 z-20 mt-1 w-32 overflow-hidden rounded-sm border border-gray-200 bg-white shadow-lg"
        >
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onView();
            }}
            className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
          >
            View
          </button>
          {can(role, "task", "delete") && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete(id);
              }}
              className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default List;
