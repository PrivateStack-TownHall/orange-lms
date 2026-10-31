import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import {
  Folder,
  FileText,
  Video,
  Link2,
  Download,
  MoreVertical,
  Eye,
} from "lucide-react";

import usePopupStore from "@/app/store/popupStore";

import { PAGE_META } from "@/constants/pageMeta";

import { useBreadcrumbs, usePagination, useSearch } from "@/hooks";

import { can, formatDate } from "@/helpers";

import MaterialService from "@/services/modules/material.service";

import PageHeader from "@/components/ui/page/PageHeader";
import LoadingPage from "@/components/ui/loading/LoadingPage";
import PopUp from "@/components/ui/popup/PopUp";
import StatsGrid from "@/components/ui/cards/StatsGrid";

import Table from "@/components/ui/tables/Table";
import TableActions from "@/components/ui/tables/TableActions";
import TableControls from "@/components/ui/tables/TableControls";
import Pagination from "@/components/ui/tables/Pagination";
import EmptyTable from "@/components/ui/tables/EmptyTable";

import MaterialDetail from "./Detail";

const TYPE_ICON = {
  PDF: FileText,
  Document: FileText,
  JPG: FileText,
  URL: Link2,
};

const TYPE_TONE = {
  PDF: "bg-red-100 text-red-600",
  Document: "bg-blue-100 text-blue-600",
  JPG: "bg-purple-100 text-purple-600",
  URL: "bg-green-100 text-green-600",
};

const List = () => {
  const breadcrumbs = useBreadcrumbs();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("table");

  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const role = user?.role;

  const page = PAGE_META.materials?.[role] || PAGE_META.materials?.Admin;

  const { openConfirm, openError, openSuccess } = usePopupStore();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await MaterialService.getAll();
        setData(res.data || []);
      } catch (error) {
        console.error(error);
        openError({
          title: "Load Failed",
          message:
            error?.response?.data?.message || "Failed to load materials.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [openError]);

  const { query, setQuery, searchedData } = useSearch(data, [
    "name",
    "description",
    "type",
  ]);

  const [classFilter, setClassFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const classOptions = useMemo(() => {
    const map = new Map();
    data.forEach(
      (m) =>
        m.Class &&
        map.set(m.Class.id, { label: m.Class.name, value: String(m.Class.id) }),
    );
    return Array.from(map.values());
  }, [data]);

  const filteredData = useMemo(() => {
    return searchedData.filter((row) => {
      if (classFilter && String(row.Class?.id) !== classFilter) return false;
      if (typeFilter && row.type !== typeFilter) return false;
      return true;
    });
  }, [searchedData, classFilter, typeFilter]);

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
      title: "Delete Material",
      message:
        "Are you sure you want to delete this material? This action cannot be undone.",
      action: async () => {
        try {
          await MaterialService.delete(id);
          setData((prev) => prev.filter((item) => item.id !== id));
          openSuccess({
            title: "Success",
            message: "Material deleted successfully.",
          });
        } catch (error) {
          console.error(error);
          openError({
            title: "Delete Failed",
            message:
              error?.response?.data?.message || "Failed to delete material.",
          });
        }
      },
    });
  };

  const openMaterialDetail = (row) => {
    setSelectedMaterial(row);
    setOpenDetail(true);
  };

  const stats = useMemo(() => {
    const total = data.length;
    const documents = data.filter((m) =>
      ["PDF", "Document", "JPG"].includes(m.type),
    ).length;
    const links = data.filter((m) => m.type === "URL").length;
    const withFile = data.filter((m) => m.fileUrl).length;

    return [
      {
        title: "Total Materials",
        value: total,
        description: "All materials",
        icon: Folder,
        tone: "blue",
      },
      {
        title: "Documents",
        value: documents,
        description: "PDF, DOCX, JPG",
        icon: FileText,
        tone: "orange",
      },
      {
        title: "Links",
        value: links,
        description: "External links",
        icon: Link2,
        tone: "green",
      },
      {
        title: "With File",
        value: withFile,
        description: "Downloadable",
        icon: Video,
        tone: "purple",
      },
    ];
  }, [data]);

  const columns = [
    {
      key: "name",
      label: "Material",
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
      key: "type",
      label: "Type",
      render: (row) => {
        const Icon = TYPE_ICON[row.type] || FileText;
        return (
          <>
            <span
              className={`flex items-center justify-items-center gap-3 rounded-sm px-2 py-1 text-xs font-medium ${TYPE_TONE[row.type] || "bg-gray-100 text-gray-600"}`}
            >
              <Icon size={12} />
              {row.type || "-"}
            </span>
          </>
        );
      },
    },
    {
      key: "uploader",
      label: "Uploaded By",
      render: (row) => row.uploader?.name || "-",
    },
    {
      key: "createdAt",
      label: "Uploaded At",
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
            resource="material"
            editUrl={`/materials/edit/${row.id}`}
            onDelete={handleRemove}
            onDetail={() => openMaterialDetail(row)}
          />
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paginatedData, role],
  );

  if (loading) {
    return <LoadingPage title="Loading Materials..." />;
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
          searchPlaceholder="Search materials by title, type, or class..."
          filters={[
            {
              key: "class",
              label: "Classes",
              value: classFilter,
              onChange: setClassFilter,
              options: classOptions,
            },
            {
              key: "type",
              label: "Types",
              value: typeFilter,
              onChange: setTypeFilter,
              options: ["PDF", "Document", "JPG", "URL"],
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
        <MaterialGrid
          data={paginatedData}
          role={role}
          onDelete={handleRemove}
          onView={openMaterialDetail}
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
        title={selectedMaterial?.name}
      >
        <MaterialDetail
          material={selectedMaterial}
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

const MaterialGrid = ({ data, role, onDelete, onView }) => {
  if (!data.length) {
    return (
      <EmptyTable
        title="No Materials Found"
        description="There are no materials to display."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {data.map((row) => {
        const Icon = TYPE_ICON[row.type] || FileText;
        return (
          <div
            key={row.id}
            className="flex flex-col rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4"
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-sm ${TYPE_TONE[row.type] || "bg-gray-100 text-gray-600"}`}
              >
                <Icon size={18} />
              </div>
              <MaterialGridMenu
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

            <span
              className={`mt-3 w-fit rounded-sm px-2 py-1 text-xs font-medium ${TYPE_TONE[row.type] || "bg-gray-100 text-gray-600"}`}
            >
              {row.type || "-"}
            </span>

            {row.fileUrl && (
              <a
                href={row.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex w-fit items-center gap-1 rounded-sm bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
              >
                <Download size={12} /> Download
              </a>
            )}

            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
              {row.uploader?.name || "-"} ·{" "}
              {row.createdAt ? formatDate(row.createdAt) : "-"}
            </p>

            <button
              onClick={() => onView(row)}
              className="mt-4 inline-flex items-center justify-center gap-1 rounded-sm border border-gray-200 py-2 text-sm font-medium hover:bg-gray-50"
            >
              <Eye size={14} /> View Material
            </button>
          </div>
        );
      })}
    </div>
  );
};

const MaterialGridMenu = ({ id, role, onDelete, onView }) => {
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
          {can(role, "material", "delete") && (
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
