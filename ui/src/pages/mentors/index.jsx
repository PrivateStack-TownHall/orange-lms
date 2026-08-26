import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  Users,
  UserCheck,
  UserX,
  MoreVertical,
  BookOpen,
  GraduationCap,
} from "lucide-react";

import usePopupStore from "@/app/store/popupStore";

import { PAGE_META } from "@/constants/pageMeta";

import { useBreadcrumbs, usePagination, useSearch } from "@/hooks";

import { can } from "@/helpers";

import MentorService from "@/services/modules/mentor.service";

import LoadingPage from "@/components/ui/loading/LoadingPage";
import PageHeader from "@/components/ui/page/PageHeader";
import StatsGrid from "@/components/ui/cards/StatsGrid";

import Table from "@/components/ui/tables/Table";
import TableActions from "@/components/ui/tables/TableActions";
import TableControls from "@/components/ui/tables/TableControls";
import Pagination from "@/components/ui/tables/Pagination";
import EmptyTable from "@/components/ui/tables/EmptyTable";
import Avatar from "@/components/ui/avatar/Avatar";

const List = () => {
  const breadcrumbs = useBreadcrumbs();

  const user = useSelector((state) => state.auth.user);
  const role = user?.role;

  const page = PAGE_META.mentors?.[role] || PAGE_META.mentors?.Admin;

  const { openConfirm, openError, openSuccess } = usePopupStore();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("table");

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await MentorService.getAll();
        setData(res.data || []);
      } catch (error) {
        console.error(error);
        openError({
          title: "Load Failed",
          message: error?.response?.data?.message || "Failed to load mentors.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [openError]);

  const { query, setQuery, searchedData } = useSearch(data, ["name", "email"]);

  const [statusFilter, setStatusFilter] = useState("");

  const filteredData = useMemo(() => {
    if (!statusFilter) return searchedData;
    return searchedData.filter((m) =>
      statusFilter === "Active" ? m.isActive : !m.isActive,
    );
  }, [searchedData, statusFilter]);

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
      title: "Delete Mentor",
      message:
        "Are you sure you want to delete this mentor? This action cannot be undone.",
      action: async () => {
        try {
          await MentorService.delete(id);
          setData((prev) => prev.filter((item) => item.id !== id));
          openSuccess({
            title: "Success",
            message: "Mentor deleted successfully.",
          });
        } catch (error) {
          console.error(error);
          openError({
            title: "Delete Failed",
            message:
              error?.response?.data?.message || "Failed to delete mentor.",
          });
        }
      },
    });
  };

  const stats = useMemo(() => {
    const total = data.length;
    const active = data.filter((m) => m.isActive).length;
    const inactive = total - active;
    const totalClasses = data.reduce(
      (sum, m) => sum + (m.mentoredClasses?.length || 0),
      0,
    );

    return [
      {
        title: "Total Mentors",
        value: total,
        description: "All mentors",
        icon: Users,
        tone: "orange",
      },
      {
        title: "Active Mentors",
        value: active,
        description: "Currently active",
        icon: UserCheck,
        tone: "green",
      },
      {
        title: "Inactive Mentors",
        value: inactive,
        description: "Not active",
        icon: UserX,
        tone: "purple",
      },
      {
        title: "Assigned Classes",
        value: totalClasses,
        description: "Across all mentors",
        icon: BookOpen,
        tone: "blue",
      },
    ];
  }, [data]);

  const columns = [
    {
      key: "name",
      label: "Mentor",
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
      key: "background",
      label: "Expertise",
      render: (row) => (
        <span className="line-clamp-1 text-xs text-[var(--color-text-muted)]">
          {row.profile?.background || "-"}
        </span>
      ),
    },
    {
      key: "classes",
      label: "Classes",
      render: (row) => row.mentoredClasses?.length || 0,
    },
    {
      key: "mentees",
      label: "Mentees",
      render: (row) =>
        row.mentoredClasses?.reduce(
          (sum, c) => sum + (c.mentees?.length || 0),
          0,
        ) || 0,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`rounded-sm px-2 py-1 text-xs font-medium ${
            row.isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
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
            resource="mentor"
            detailUrl={`/mentors/${row.id}`}
            editUrl={`/mentors/edit/${row.id}`}
            onDelete={handleRemove}
          />
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginatedData, role],
  );

  if (loading) {
    return <LoadingPage title="Loading Mentors..." />;
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
          searchPlaceholder="Search mentors by name, email, or expertise..."
          filters={[
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              onChange: setStatusFilter,
              options: ["Active", "Inactive"],
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
        <MentorGrid data={paginatedData} role={role} onDelete={handleRemove} />
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

const MentorGrid = ({ data, role, onDelete }) => {
  if (!data.length) {
    return (
      <EmptyTable
        title="No Mentors Found"
        description="There are no mentors to display."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {data.map((mentor) => (
        <div
          key={mentor.id}
          className="flex flex-col rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={mentor.avatarUrl} name={mentor.name} size="sm" />
              <div>
                <p className="font-semibold text-[var(--color-text)]">
                  {mentor.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  @{mentor.email?.split("@")[0]}
                </p>
              </div>
            </div>

            <MentorGridMenu id={mentor.id} role={role} onDelete={onDelete} />
          </div>

          <span className="mt-3 line-clamp-1 rounded-sm bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
            {mentor.profile?.background || "No expertise listed"}
          </span>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <BookOpen size={12} className="text-[var(--color-text-muted)]" />
              {mentor.mentoredClasses?.length || 0} Classes
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap
                size={12}
                className="text-[var(--color-text-muted)]"
              />
              {mentor.mentoredClasses?.reduce(
                (sum, c) => sum + (c.mentees?.length || 0),
                0,
              ) || 0}{" "}
              Mentees
            </div>
          </div>

          <span
            className={`mt-3 w-fit rounded-sm px-2 py-1 text-xs font-medium ${
              mentor.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {mentor.isActive ? "Active" : "Inactive"}
          </span>

          <Link
            to={`/mentors/${mentor.id}`}
            className="mt-4 inline-flex items-center justify-center rounded-sm border border-gray-200 py-2 text-sm font-medium hover:bg-gray-50"
          >
            View Profile
          </Link>
        </div>
      ))}
    </div>
  );
};

const MentorGridMenu = ({ id, role, onDelete }) => {
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
            to={`/mentors/${id}`}
            className="block px-3 py-2 text-sm hover:bg-gray-50"
          >
            View
          </Link>
          {can(role, "mentor", "update") && (
            <Link
              to={`/mentors/edit/${id}`}
              className="block px-3 py-2 text-sm hover:bg-gray-50"
            >
              Edit
            </Link>
          )}
          {can(role, "mentor", "delete") && (
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
