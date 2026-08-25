import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ShieldCheck,
  UserCheck,
  UserX,
  MoreVertical,
} from "lucide-react";

import usePopupStore from "@/app/store/popupStore";

import { PAGE_META } from "@/constants/pageMeta";

import { useBreadcrumbs, usePagination, useSearch } from "@/hooks";

import UserService from "@/services/modules/user.service";

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

  const page = PAGE_META.admins?.Owner || {
    title: "Admin Management",
    description: "Manage administrator accounts",
  };

  const { openConfirm, openError, openSuccess } = usePopupStore();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("table");

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await UserService.getAll({ role: "Admin" });
        setData(res.data || []);
      } catch (error) {
        console.error(error);
        openError({
          title: "Load Failed",
          message: error?.response?.data?.message || "Failed to load admins.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, [openError]);

  const { query, setQuery, searchedData } = useSearch(data, ["name", "email"]);

  const [statusFilter, setStatusFilter] = useState("");

  const filteredData = useMemo(() => {
    if (!statusFilter) return searchedData;
    return searchedData.filter((a) => (statusFilter === "Active" ? a.isActive : !a.isActive));
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
      title: "Delete Admin",
      message: "Are you sure you want to delete this admin? This action cannot be undone.",
      action: async () => {
        try {
          await UserService.delete(id);
          setData((prev) => prev.filter((item) => item.id !== id));
          openSuccess({ title: "Success", message: "Admin deleted successfully." });
        } catch (error) {
          console.error(error);
          openError({
            title: "Delete Failed",
            message: error?.response?.data?.message || "Failed to delete admin.",
          });
        }
      },
    });
  };

  const stats = useMemo(() => {
    const total = data.length;
    const active = data.filter((a) => a.isActive).length;
    const inactive = total - active;

    return [
      { title: "Total Admins", value: total, description: "All admins", icon: ShieldCheck, tone: "orange" },
      { title: "Active Admins", value: active, description: "Currently active", icon: UserCheck, tone: "green" },
      { title: "Inactive Admins", value: inactive, description: "Not active", icon: UserX, tone: "purple" },
    ];
  }, [data]);

  const columns = [
    {
      key: "admin",
      label: "Admin",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatarUrl} name={row.name} size="sm" />
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: "age", label: "Age", render: (row) => row.profile?.age || "-" },
    { key: "city", label: "City", render: (row) => row.profile?.city || "-" },
    { key: "phone", label: "Phone", render: (row) => row.profile?.phoneNumber || "-" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`rounded-sm px-2 py-1 text-xs font-medium ${
            row.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
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
            resource="admin"
            detailUrl={`/admins/${row.id}`}
            editUrl={`/admins/edit/${row.id}`}
            onDelete={handleRemove}
          />
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginatedData],
  );

  if (loading) {
    return <LoadingPage title="Loading Admins..." />;
  }

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <PageHeader
          breadcrumbs={breadcrumbs}
          title={page.title}
          description={page.description}
        />

        <div className="w-full shrink-0 xl:w-[420px]">
          <StatsGrid items={stats} columns={3} compact />
        </div>
      </div>

      <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
        <TableControls
          searchQuery={query}
          setSearchQuery={setQuery}
          searchPlaceholder="Search admins by name or email..."
          filters={[
            { key: "status", label: "Status", value: statusFilter, onChange: setStatusFilter, options: ["Active", "Inactive"] },
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
        <AdminGrid data={paginatedData} onDelete={handleRemove} />
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

const AdminGrid = ({ data, onDelete }) => {
  if (!data.length) {
    return <EmptyTable title="No Admins Found" description="There are no admins to display." />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {data.map((admin) => (
        <div key={admin.id} className="flex flex-col rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={admin.avatarUrl} name={admin.name} size="sm" />
              <div>
                <p className="font-semibold text-[var(--color-text)]">{admin.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{admin.email}</p>
              </div>
            </div>
            <AdminGridMenu id={admin.id} onDelete={onDelete} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--color-text-muted)]">
            <span>Age: {admin.profile?.age || "-"}</span>
            <span>City: {admin.profile?.city || "-"}</span>
          </div>

          <span
            className={`mt-3 w-fit rounded-sm px-2 py-1 text-xs font-medium ${
              admin.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
            }`}
          >
            {admin.isActive ? "Active" : "Inactive"}
          </span>

          <Link
            to={`/admins/${admin.id}`}
            className="mt-4 inline-flex items-center justify-center rounded-sm border border-gray-200 py-2 text-sm font-medium hover:bg-gray-50"
          >
            View Profile
          </Link>
        </div>
      ))}
    </div>
  );
};

const AdminGridMenu = ({ id, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((prev) => !prev)} className="rounded-sm p-1 text-gray-400 hover:bg-gray-100">
        <MoreVertical size={16} />
      </button>

      {open && (
        <div onMouseLeave={() => setOpen(false)} className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-sm border border-gray-200 bg-white shadow-lg">
          <Link to={`/admins/${id}`} className="block px-3 py-2 text-sm hover:bg-gray-50">
            View
          </Link>
          <Link to={`/admins/edit/${id}`} className="block px-3 py-2 text-sm hover:bg-gray-50">
            Edit
          </Link>
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
        </div>
      )}
    </div>
  );
};

export default List;
