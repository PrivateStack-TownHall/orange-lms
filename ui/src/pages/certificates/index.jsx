import React, { useEffect, useMemo, useState } from "react";

import { Award, Download, FileCheck2, LoaderCircle, Sparkles } from "lucide-react";

import usePopupStore from "@/app/store/popupStore";
import { formatDate } from "@/helpers";
import { useBreadcrumbs, usePagination, useSearch } from "@/hooks";
import HistoryClassService from "@/services/modules/historyClass.service";

import Button from "@/components/ui/buttons/Button";
import StatsGrid from "@/components/ui/cards/StatsGrid";
import LoadingPage from "@/components/ui/loading/LoadingPage";
import PageHeader from "@/components/ui/page/PageHeader";
import StatusBadge from "@/components/ui/status/StatusBadge";
import EmptyTable from "@/components/ui/tables/EmptyTable";
import Pagination from "@/components/ui/tables/Pagination";
import Table from "@/components/ui/tables/Table";
import TableControls from "@/components/ui/tables/TableControls";

const CertificateCenter = () => {
  const breadcrumbs = useBreadcrumbs();
  const { openError, openSuccess } = usePopupStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await HistoryClassService.getAll();
        setHistory(response.data || []);
      } catch (error) {
        console.error(error);
        openError({
          title: "Load Failed",
          message: error?.response?.data?.message || "Failed to load certificate records.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [openError]);

  const eligibleRecords = useMemo(
    () =>
      history
        .filter((record) => record.status === "Completed" && record.roleInClass === "Mentee")
        .map((record) => ({
          ...record,
          participantName: record.User?.name || "",
          participantEmail: record.User?.email || "",
          className: record.Class?.name || "",
          classCode: record.Class?.code || "",
        })),
    [history],
  );

  const { query, setQuery, searchedData } = useSearch(eligibleRecords, [
    "participantName",
    "participantEmail",
    "className",
    "classCode",
  ]);

  const {
    paginatedData,
    currentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(searchedData);

  const generateCertificate = async (record) => {
    setGeneratingId(record.id);
    try {
      const response = await HistoryClassService.generateCertificate(record.id);
      const certificateUrl = response.data?.certificateUrl;

      setHistory((previous) =>
        previous.map((item) =>
          item.id === record.id ? { ...item, certificateUrl } : item,
        ),
      );
      openSuccess({
        title: "Certificate Generated",
        message: response.data?.generated
          ? "The certificate was generated and saved to Cloudinary."
          : "This certificate had already been generated.",
      });
    } catch (error) {
      console.error(error);
      openError({
        title: "Generation Failed",
        message: error?.response?.data?.message || "Failed to generate the certificate.",
      });
    } finally {
      setGeneratingId(null);
    }
  };

  const stats = useMemo(() => {
    const generated = eligibleRecords.filter((record) => record.certificateUrl).length;

    return [
      {
        title: "Eligible Learners",
        value: eligibleRecords.length,
        description: "Completed mentee records",
        icon: Award,
        tone: "orange",
      },
      {
        title: "Generated",
        value: generated,
        description: "Ready to download",
        icon: FileCheck2,
        tone: "green",
      },
      {
        title: "To Generate",
        value: eligibleRecords.length - generated,
        description: "Awaiting certificate",
        icon: Sparkles,
        tone: "blue",
      },
    ];
  }, [eligibleRecords]);

  const columns = [
    {
      key: "participantName",
      label: "Learner",
      render: (row) => (
        <div>
          <p className="font-semibold text-[var(--color-text)]">{row.User?.name || "-"}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{row.User?.email || "-"}</p>
        </div>
      ),
    },
    {
      key: "className",
      label: "Program",
      render: (row) => (
        <div>
          <p className="font-medium text-[var(--color-text)]">{row.Class?.name || "-"}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{row.Class?.code || "-"}</p>
        </div>
      ),
    },
    {
      key: "completedAt",
      label: "Completed",
      render: (row) => (row.completedAt ? formatDate(row.completedAt) : "-"),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "certificate",
      label: "Certificate",
      render: (row) =>
        row.certificateUrl ? (
          <a
            href={row.certificateUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700"
          >
            <Download size={15} /> Download
          </a>
        ) : (
          <Button
            size="sm"
            disabled={generatingId === row.id}
            onClick={() => generateCertificate(row)}
          >
            {generatingId === row.id ? <LoaderCircle className="animate-spin" size={15} /> : <Award size={15} />}
            Generate
          </Button>
        ),
    },
  ];

  if (loading) return <LoadingPage title="Loading Certificates..." />;

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_440px] xl:items-stretch">
        <PageHeader
          breadcrumbs={breadcrumbs}
          title="Certificate Center"
          description="Generate and distribute certificates for completed learning programs."
        />
        <div className="relative overflow-hidden rounded-sm border-2 border-orange-500 bg-[#fffaf2] p-5">
          <div className="absolute inset-2 border border-orange-300" />
          <div className="relative flex h-full items-center gap-4">
            <img src="/logo.png" alt="Orange Kode" className="h-12 w-12 object-contain" />
            <div>
              <p className="font-serif text-lg font-bold tracking-wide text-slate-900">CERTIFICATE OF COMPLETION</p>
              <p className="mt-1 text-sm text-slate-600">Orange Kode learner achievement</p>
            </div>
            <Award className="ml-auto text-orange-500" size={38} />
          </div>
        </div>
      </div>

      <StatsGrid items={stats} columns={3} />

      <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
        <TableControls
          searchQuery={query}
          setSearchQuery={setQuery}
          searchPlaceholder="Search learner or program..."
          view="table"
          setView={() => {}}
        />
      </div>

      <div className="overflow-hidden rounded-sm border border-gray-200 bg-[var(--color-surface)]">
        <div className="p-4">
          {paginatedData.length ? (
            <Table columns={columns} data={paginatedData} />
          ) : (
            <EmptyTable
              title="No Eligible Learners"
              description="Completed mentee records will appear here when they are ready for certification."
              icon={Award}
            />
          )}
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        prevPage={prevPage}
        nextPage={nextPage}
        goToPage={goToPage}
        total={searchedData.length}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
      />
    </div>
  );
};

export default CertificateCenter;
