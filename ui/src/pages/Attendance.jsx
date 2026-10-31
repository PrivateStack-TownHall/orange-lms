import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  HelpCircle,
  UserX,
} from "lucide-react";

import usePopupStore from "@/app/store/popupStore";
import AttendanceService from "@/services/modules/attendance.service";
import { useBreadcrumbs, usePagination, useSearch } from "@/hooks";
import PageHeader from "@/components/ui/page/PageHeader";
import StatsGrid from "@/components/ui/cards/StatsGrid";
import Table from "@/components/ui/tables/Table";
import TableControls from "@/components/ui/tables/TableControls";
import Pagination from "@/components/ui/tables/Pagination";
import LoadingPage from "@/components/ui/loading/LoadingPage";
import Avatar from "@/components/ui/avatar/Avatar";

const STATUS_TONE = {
  Present: "bg-green-100 text-green-700",
  Late: "bg-amber-100 text-amber-700",
  Absent: "bg-red-100 text-red-700",
  Excused: "bg-blue-100 text-blue-700",
};

const STATUS_OPTIONS = ["Present", "Late", "Absent", "Excused"];

const Attendance = () => {
  const breadcrumbs = useBreadcrumbs();
  const role = useSelector((state) => state.auth.user?.role);
  const { openError } = usePopupStore();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await AttendanceService.getAll();
        setRecords(response.data || []);
      } catch (error) {
        openError({
          title: "Load Failed",
          message: error?.response?.data?.message || "Failed to load attendance.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [openError]);

  const searchRecords = useMemo(
    () =>
      records.map((record) => ({
        ...record,
        search: [
          record.User?.name,
          record.User?.email,
          record.Meeting?.name,
          record.Meeting?.class?.name,
          record.Meeting?.class?.code,
        ]
          .filter(Boolean)
          .join(" "),
      })),
    [records],
  );

  const { query, setQuery, searchedData } = useSearch(searchRecords, ["search"]);

  const classOptions = useMemo(
    () =>
      Array.from(
        new Map(
          records
            .filter((record) => record.Meeting?.class)
            .map((record) => [
              record.Meeting.class.id,
              {
                value: String(record.Meeting.class.id),
                label: record.Meeting.class.name,
              },
            ]),
        ).values(),
      ),
    [records],
  );

  const filteredRecords = useMemo(
    () =>
      searchedData.filter((record) => {
        const matchesClass =
          !classFilter || String(record.Meeting?.class?.id) === classFilter;
        const matchesStatus = !statusFilter || record.status === statusFilter;
        return matchesClass && matchesStatus;
      }),
    [searchedData, classFilter, statusFilter],
  );

  const {
    paginatedData,
    currentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(filteredRecords);

  const stats = useMemo(
    () => [
      {
        title: "Attendance Records",
        value: records.length,
        description: "Recorded entries",
        icon: CalendarDays,
        tone: "blue",
      },
      {
        title: "Present",
        value: records.filter((record) => record.status === "Present").length,
        description: "On time",
        icon: CheckCircle2,
        tone: "green",
      },
      {
        title: "Late",
        value: records.filter((record) => record.status === "Late").length,
        description: "Checked in late",
        icon: Clock3,
        tone: "orange",
      },
      {
        title: "Absent",
        value: records.filter((record) => record.status === "Absent").length,
        description: "Not present",
        icon: UserX,
        tone: "red",
      },
      {
        title: "Excused",
        value: records.filter((record) => record.status === "Excused").length,
        description: "Approved absence",
        icon: HelpCircle,
        tone: "purple",
      },
    ],
    [records],
  );

  const columns = [
    {
      key: "mentee",
      label: "Mentee",
      render: (record) => (
        <div className="flex items-center gap-2">
          <Avatar name={record.User?.name} size="xs" />
          <div>
            <p className="font-medium">{record.User?.name || "-"}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {record.User?.email || "-"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "meeting",
      label: "Meeting",
      render: (record) => (
        <div>
          <p className="font-medium">{record.Meeting?.name || "-"}</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {record.Meeting?.class?.name || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (record) => (
        <span className={`rounded-sm px-2 py-1 text-xs font-medium ${STATUS_TONE[record.status]}`}>
          {record.status}
        </span>
      ),
    },
    {
      key: "checkInAt",
      label: "Check-in",
      render: (record) =>
        record.checkInAt
          ? new Date(record.checkInAt).toLocaleString("id-ID")
          : "-",
    },
    {
      key: "checker",
      label: "Marked By",
      render: (record) => record.checker?.name || "-",
    },
    {
      key: "actions",
      label: "Actions",
      render: (record) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/attendance/${record.id}`}
            title="View attendance"
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-gray-200 text-[var(--color-text-muted)] hover:bg-gray-50"
          >
            <Eye size={15} />
          </Link>
          {role !== "Mentee" && record.Meeting?.id && (
            <Link
              to={`/meetings/${record.Meeting.id}`}
              className="rounded-sm border border-gray-200 px-2 py-1.5 text-xs font-medium hover:bg-gray-50"
            >
              Meeting
            </Link>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <LoadingPage title="Loading Attendance..." />;

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <PageHeader
          breadcrumbs={breadcrumbs}
          title={role === "Mentee" ? "My Attendance" : "Attendance"}
          description={
            role === "Mentee"
              ? "Review attendance recorded for your meetings."
              : "Review attendance across accessible classes and meetings."
          }
        />
        <div className="w-full shrink-0 xl:w-[840px]">
          <StatsGrid items={stats} columns={5} compact />
        </div>
      </div>

      <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
        <TableControls
          searchQuery={query}
          setSearchQuery={setQuery}
          searchPlaceholder="Search mentee, class, or meeting..."
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
              label: "Statuses",
              value: statusFilter,
              onChange: setStatusFilter,
              options: STATUS_OPTIONS,
            },
          ]}
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
        total={filteredRecords.length}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
};

export default Attendance;
