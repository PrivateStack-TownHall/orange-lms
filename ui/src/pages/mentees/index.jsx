import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { Users, UserCheck, Clock, UserX, MoreVertical } from "lucide-react";

import usePopupStore from "@/app/store/popupStore";

import { PAGE_META } from "@/constants/pageMeta";

import { useBreadcrumbs, usePagination, useSearch } from "@/hooks";

import { can } from "@/helpers";

import MenteeService from "@/services/modules/mentee.service";

import LoadingPage from "@/components/ui/loading/LoadingPage";
import PageHeader from "@/components/ui/page/PageHeader";
import StatsGrid from "@/components/ui/cards/StatsGrid";

import Table from "@/components/ui/tables/Table";
import TableActions from "@/components/ui/tables/TableActions";
import TableControls from "@/components/ui/tables/TableControls";
import Pagination from "@/components/ui/tables/Pagination";
import EmptyTable from "@/components/ui/tables/EmptyTable";
import Avatar from "@/components/ui/avatar/Avatar";
import ProgressBar from "@/components/ui/progress/ProgressBar";

const menteeStatus = (mentee) => {
  if (!mentee.isActive) return "Inactive";
  const statuses =
    mentee.enrolledClasses?.map((c) => c.ClassUser?.status) || [];
  if (statuses.includes("OnHold")) return "On Hold";
  return "Active";
};

const STATUS_TONE = {
  Active: "bg-green-100 text-green-700",
  "On Hold": "bg-amber-100 text-amber-700",
  Inactive: "bg-red-100 text-red-700",
};

const primaryClass = (mentee) => mentee.enrolledClasses?.[0];

const avgProgress = (mentee) => {
  const classes = mentee.enrolledClasses || [];
  if (!classes.length) return 0;
  const total = classes.reduce(
    (sum, c) => sum + Number(c.ClassUser?.progressPercentage || 0),
    0,
  );
  return Math.round(total / classes.length);
};

const List = () => {
  const breadcrumbs = useBreadcrumbs();

  const user = useSelector((state) => state.auth.user);
  const role = user?.role;

  const page = PAGE_META.mentees?.[role] || PAGE_META.mentees?.Admin;

  const { openConfirm, openError, openSuccess } = usePopupStore();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("table");

  useEffect(() => {
    const fetchMentees = async () => {
      try {
        const res = await MenteeService.getAll();
        setData(res.data || []);
      } catch (error) {
        console.error(error);
        openError({
          title: "Load Failed",
          message: error?.response?.data?.message || "Failed to load mentees.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMentees();
  }, [openError]);

  const { query, setQuery, searchedData } = useSearch(data, ["name", "email"]);

  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const classOptions = useMemo(() => {
    const map = new Map();
    data.forEach((m) =>
      (m.enrolledClasses || []).forEach((c) =>
        map.set(c.id, { label: c.name, value: String(c.id) }),
      ),
    );
    return Array.from(map.values());
  }, [data]);

  const filteredData = useMemo(() => {
    return searchedData.filter((m) => {
      if (
        classFilter &&
        !m.enrolledClasses?.some((c) => String(c.id) === classFilter)
      )
        return false;
      if (statusFilter && menteeStatus(m) !== statusFilter) return false;
      return true;
    });
  }, [searchedData, classFilter, statusFilter]);

  const {
    paginatedData,
    currentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(filteredData, view === "grid" ? 8 : 10);

  const handleRemove = (id) => {
    openConfirm({
      title: "Delete Mentee",
      message:
        "Are you sure you want to delete this mentee? This action cannot be undone.",
      action: async () => {
        try {
          await MenteeService.delete(id);
          setData((prev) => prev.filter((item) => item.id !== id));
          openSuccess({
            title: "Success",
            message: "Mentee deleted successfully.",
          });
        } catch (error) {
          console.error(error);
          openError({
            title: "Delete Failed",
            message:
              error?.response?.data?.message || "Failed to delete mentee.",
          });
        }
      },
    });
  };

  const stats = useMemo(() => {
    const total = data.length;
    const active = data.filter((m) => menteeStatus(m) === "Active").length;
    const onHold = data.filter((m) => menteeStatus(m) === "On Hold").length;
    const inactive = data.filter((m) => menteeStatus(m) === "Inactive").length;

    return [
      {
        title: "Total Mentees",
        value: total,
        description: "All mentees",
        icon: Users,
        tone: "orange",
      },
      {
        title: "Active Mentees",
        value: active,
        description: "Currently active",
        icon: UserCheck,
        tone: "green",
      },
      {
        title: "On Hold",
        value: onHold,
        description: "Temporarily inactive",
        icon: Clock,
        tone: "amber",
      },
      {
        title: "Inactive",
        value: inactive,
        description: "Not active",
        icon: UserX,
        tone: "red",
      },
    ];
  }, [data]);

  const columns = [
    {
      key: "name",
      label: "Mentee",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatarUrl} name={row.name} size="sm" />
          <div>
            <p className="font-semibold text-[var(--color-text)]">{row.name}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              @{row.email?.split("@")[0]}
            </p>
          </div>
        </div>
      ),
    },
    { key: "email", label: "Email" },
    {
      key: "class",
      label: "Class",
      render: (row) => {
        const cls = primaryClass(row);
        return cls ? (
          <div>
            <p className="text-[var(--color-primary)]">{cls.name}</p>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              {cls.code}
            </span>
          </div>
        ) : (
          "-"
        );
      },
    },
    {
      key: "level",
      label: "Level",
      render: (row) => primaryClass(row)?.level || "-",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`rounded-sm px-2 py-1 text-xs font-medium ${STATUS_TONE[menteeStatus(row)]}`}
        >
          {menteeStatus(row)}
        </span>
      ),
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
            resource="mentee"
            detailUrl={`/mentees/${row.id}`}
            editUrl={`/mentees/edit/${row.id}`}
            onDelete={handleRemove}
          />
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginatedData, role],
  );

  if (loading) {
    return <LoadingPage title="Loading Mentees..." />;
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
          searchPlaceholder="Search mentees by name, email, or class..."
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
              options: ["Active", "On Hold", "Inactive"],
            },
          ]}
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
        <MenteeGrid data={paginatedData} role={role} onDelete={handleRemove} />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        prevPage={prevPage}
        nextPage={nextPage}
        goToPage={goToPage}
        total={filteredData.length}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        pageSizeOptions={view === "grid" ? [8, 16, 24] : [10, 25, 50]}
      />
    </div>
  );
};

const MenteeGrid = ({ data, role, onDelete }) => {
  if (!data.length) {
    return (
      <EmptyTable
        title="No Mentees Found"
        description="There are no mentees to display."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {data.map((mentee) => {
        const cls = primaryClass(mentee);
        return (
          <div
            key={mentee.id}
            className="flex flex-col rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={mentee.avatarUrl} name={mentee.name} size="sm" />
                <div>
                  <p className="font-semibold text-[var(--color-text)]">
                    {mentee.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    @{mentee.email?.split("@")[0]}
                  </p>
                </div>
              </div>
              <MenteeGridMenu id={mentee.id} role={role} onDelete={onDelete} />
            </div>

            <p className="mt-3 text-xs text-[var(--color-primary)]">
              {cls?.name || "No class enrolled"}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {cls?.level && (
                <span className="rounded-sm bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                  {cls.level}
                </span>
              )}
              <span
                className={`rounded-sm px-2 py-1 text-xs font-medium ${STATUS_TONE[menteeStatus(mentee)]}`}
              >
                {menteeStatus(mentee)}
              </span>
            </div>

            <div className="mt-3">
              <ProgressBar value={avgProgress(mentee)} />
            </div>

            <Link
              to={`/mentees/${mentee.id}`}
              className="mt-4 inline-flex items-center justify-center rounded-sm border border-gray-200 py-2 text-sm font-medium hover:bg-gray-50"
            >
              View Profile
            </Link>
          </div>
        );
      })}
    </div>
  );
};

const MenteeGridMenu = ({ id, role, onDelete }) => {
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
          className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-sm border border-gray-200 bg-white shadow-lg"
        >
          <Link
            to={`/mentees/${id}`}
            className="block px-3 py-2 text-sm hover:bg-gray-50"
          >
            View
          </Link>
          {can(role, "mentee", "update") && (
            <Link
              to={`/mentees/edit/${id}`}
              className="block px-3 py-2 text-sm hover:bg-gray-50"
            >
              Edit
            </Link>
          )}
          {can(role, "mentee", "delete") && (
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
