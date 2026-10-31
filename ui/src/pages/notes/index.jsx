import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import {
  StickyNote,
  Paperclip,
  FileX,
  CalendarClock,
  Download,
  MoreVertical,
  Eye,
} from "lucide-react";

import usePopupStore from "@/app/store/popupStore";

import { PAGE_META } from "@/constants/pageMeta";

import { useBreadcrumbs, usePagination, useSearch } from "@/hooks";

import { can, formatDate } from "@/helpers";

import NoteService from "@/services/modules/note.service";

import PageHeader from "@/components/ui/page/PageHeader";
import LoadingPage from "@/components/ui/loading/LoadingPage";
import PopUp from "@/components/ui/popup/PopUp";
import StatsGrid from "@/components/ui/cards/StatsGrid";

import Table from "@/components/ui/tables/Table";
import TableActions from "@/components/ui/tables/TableActions";
import TableControls from "@/components/ui/tables/TableControls";
import Pagination from "@/components/ui/tables/Pagination";
import EmptyTable from "@/components/ui/tables/EmptyTable";

import NoteDetail from "./Detail";

const List = () => {
  const breadcrumbs = useBreadcrumbs();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("table");

  const [selectedNote, setSelectedNote] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const role = user?.role;

  const page = PAGE_META.notes?.[role] || PAGE_META.notes?.Admin;

  const { openConfirm, openError, openSuccess } = usePopupStore();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await NoteService.getAll();
        setData(res.data || []);
      } catch (error) {
        console.error(error);
        openError({
          title: "Load Failed",
          message: error?.response?.data?.message || "Failed to load notes.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [openError]);

  const { query, setQuery, searchedData } = useSearch(data, [
    "name",
    "description",
  ]);

  const [classFilter, setClassFilter] = useState("");

  const classOptions = useMemo(() => {
    const map = new Map();
    data.forEach(
      (n) =>
        n.Class &&
        map.set(n.Class.id, { label: n.Class.name, value: String(n.Class.id) }),
    );
    return Array.from(map.values());
  }, [data]);

  const filteredData = useMemo(
    () =>
      searchedData.filter(
        (row) => !classFilter || String(row.Class?.id) === classFilter,
      ),
    [searchedData, classFilter],
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
  } = usePagination(filteredData, view === "grid" ? 8 : 10);

  const handleRemove = (id) => {
    openConfirm({
      title: "Delete Note",
      message:
        "Are you sure you want to delete this note? This action cannot be undone.",
      action: async () => {
        try {
          await NoteService.delete(id);
          setData((prev) => prev.filter((item) => item.id !== id));
          openSuccess({
            title: "Success",
            message: "Note deleted successfully.",
          });
        } catch (error) {
          console.error(error);
          openError({
            title: "Delete Failed",
            message: error?.response?.data?.message || "Failed to delete note.",
          });
        }
      },
    });
  };

  const openNoteDetail = (row) => {
    setSelectedNote(row);
    setOpenDetail(true);
  };

  const stats = useMemo(() => {
    const total = data.length;
    const withAttachment = data.filter((n) => n.fileUrl).length;
    const noAttachment = total - withAttachment;
    const now = new Date();
    const thisMonth = data.filter((n) => {
      const d = new Date(n.createdAt);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;

    return [
      {
        title: "Total Notes",
        value: total,
        description: "All notes",
        icon: StickyNote,
        tone: "blue",
      },
      {
        title: "With Attachment",
        value: withAttachment,
        description: "Has file",
        icon: Paperclip,
        tone: "green",
      },
      {
        title: "No Attachment",
        value: noAttachment,
        description: "Text only",
        icon: FileX,
        tone: "gray",
      },
      {
        title: "Added This Month",
        value: thisMonth,
        description: "Recent notes",
        icon: CalendarClock,
        tone: "purple",
      },
    ];
  }, [data]);

  const columns = [
    {
      key: "name",
      label: "Note Title",
      render: (row) => (
        <div>
          <p className="font-semibold text-[var(--color-text)">
            {row.name || "-"}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {row.description || "-"}
          </p>
          {row.fileUrl ? (
            <a
              href={row.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-sm bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
            >
              <Download size={12} /> Download
            </a>
          ) : (
            "-"
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
    {
      key: "meeting",
      label: "Meeting",
      render: (row) =>
        row.Meeting ? `Meeting #${row.Meeting.meetingNumber}` : "-",
    },
    {
      key: "creator",
      label: "Author",
      render: (row) => row.creator?.name || "-",
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (row) => (row.createdAt ? formatDate(row.createdAt) : "-"),
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
            resource="note"
            editUrl={`/notes/edit/${row.id}`}
            onDelete={handleRemove}
            onDetail={() => openNoteDetail(row)}
          />
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginatedData, role],
  );

  if (loading) {
    return <LoadingPage title="Loading Notes..." />;
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
          searchPlaceholder="Search notes by title, class, or author..."
          filters={[
            {
              key: "class",
              label: "Classes",
              value: classFilter,
              onChange: setClassFilter,
              options: classOptions,
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
        <NoteGrid
          data={paginatedData}
          role={role}
          onDelete={handleRemove}
          onView={openNoteDetail}
        />
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

      <PopUp
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        title={selectedNote?.name}
      >
        <NoteDetail
          note={selectedNote}
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

const NOTE_ICON_TONE = [
  "bg-blue-100 text-blue-600",
  "bg-orange-100 text-orange-600",
  "bg-green-100 text-green-600",
  "bg-purple-100 text-purple-600",
];

const NoteGrid = ({ data, role, onDelete, onView }) => {
  if (!data.length) {
    return (
      <EmptyTable
        title="No Notes Found"
        description="There are no notes to display."
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
              className={`flex h-10 w-10 items-center justify-center rounded-sm ${NOTE_ICON_TONE[index % NOTE_ICON_TONE.length]}`}
            >
              <StickyNote size={18} />
            </div>
            <NoteGridMenu
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

          {row.fileUrl ? (
            <a
              href={row.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex w-fit items-center gap-1 rounded-sm bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
            >
              <Download size={12} /> Download
            </a>
          ) : (
            <span className="mt-3 text-xs text-[var(--color-text-muted)]">
              No attachment
            </span>
          )}

          <p className="mt-3 text-xs text-[var(--color-text-muted)]">
            {row.creator?.name || "-"} ·{" "}
            {row.createdAt ? formatDate(row.createdAt) : "-"}
          </p>

          <button
            onClick={() => onView(row)}
            className="mt-4 inline-flex items-center justify-center gap-1 rounded-sm border border-gray-200 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <Eye size={14} /> View Note
          </button>
        </div>
      ))}
    </div>
  );
};

const NoteGridMenu = ({ id, role, onDelete, onView }) => {
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
          {can(role, "note", "delete") && (
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
