import React, { createElement, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  ArrowLeft,
  Award,
  CalendarDays,
  Download,
  RotateCcw,
  Trash2,
  UserRound,
} from "lucide-react";

import usePopupStore from "@/app/store/popupStore";
import { formatDate } from "@/helpers";
import { useBreadcrumbs } from "@/hooks";
import HistoryClassService from "@/services/modules/historyClass.service";

import Button from "@/components/ui/buttons/Button";
import LoadingPage from "@/components/ui/loading/LoadingPage";
import PageHeader from "@/components/ui/page/PageHeader";
import StatusBadge from "@/components/ui/status/StatusBadge";

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="rounded-sm bg-gray-100 p-2 text-gray-600">
      {createElement(Icon, { size: 16 })}
    </div>
    <div>
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-[var(--color-text)]">{value || "-"}</p>
    </div>
  </div>
);

const HistoryClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const breadcrumbs = useBreadcrumbs();
  const user = useSelector((state) => state.auth.user);
  const { openConfirm, openError, openSuccess } = usePopupStore();

  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await HistoryClassService.getById(id);
        setHistory(response.data || null);
      } catch (error) {
        console.error(error);
        openError({
          title: "Load Failed",
          message: error?.response?.data?.message || "Failed to load class history.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id, openError]);

  const restoreClass = () => {
    openConfirm({
      title: "Restore Class",
      message:
        "This restores the original class and removes every archived history record for it.",
      confirmLabel: "Restore",
      action: async () => {
        setActionLoading(true);
        try {
          await HistoryClassService.restore(id);
          openSuccess({
            title: "Class Restored",
            message: "The class is active again and its archived records were removed.",
          });
          navigate("/history-classes");
        } catch (error) {
          console.error(error);
          openError({
            title: "Restore Failed",
            message: error?.response?.data?.message || "Failed to restore the class.",
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const deleteHistory = () => {
    openConfirm({
      title: "Delete History Record",
      message: "This permanently removes this participant's history record.",
      confirmLabel: "Delete",
      action: async () => {
        setActionLoading(true);
        try {
          await HistoryClassService.delete(id);
          openSuccess({
            title: "History Deleted",
            message: "The history record has been deleted.",
          });
          navigate("/history-classes");
        } catch (error) {
          console.error(error);
          openError({
            title: "Delete Failed",
            message: error?.response?.data?.message || "Failed to delete the history record.",
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  if (loading) return <LoadingPage title="Loading Class History..." />;

  if (!history) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-4">
        <Link
          to="/history-classes"
          className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          <ArrowLeft size={16} /> Back to History Classes
        </Link>
      </div>
    );
  }

  const canRestore = ["Owner", "Admin"].includes(user?.role);
  const canDelete = user?.role === "Owner";

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <PageHeader
          breadcrumbs={breadcrumbs}
          title={history.Class?.name || "Class History"}
          description="Archived participant record and completion details."
        />
        <div className="flex flex-wrap gap-2">
          <Link
            to="/history-classes"
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <ArrowLeft size={16} /> Back
          </Link>
          {canRestore && (
            <Button disabled={actionLoading} variant="outline" onClick={restoreClass}>
              <RotateCcw size={16} /> Restore Class
            </Button>
          )}
          {canDelete && (
            <Button disabled={actionLoading} variant="danger" onClick={deleteHistory}>
              <Trash2 size={16} /> Delete Record
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Participant</p>
              <h2 className="mt-1 text-xl font-semibold text-[var(--color-text)]">
                {history.User?.name || "-"}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {history.User?.email || "-"}
              </p>
            </div>
            <StatusBadge status={history.status} />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <DetailItem icon={Award} label="Final Score" value={history.finalScore ?? "-"} />
            <DetailItem
              icon={CalendarDays}
              label="Attendance"
              value={history.attendancePercentage != null ? `${history.attendancePercentage}%` : "-"}
            />
            <DetailItem icon={UserRound} label="Role in Class" value={history.roleInClass} />
            <DetailItem
              icon={CalendarDays}
              label="Completed At"
              value={history.completedAt ? formatDate(history.completedAt) : "-"}
            />
          </div>

          <div className="mt-6 border-t border-gray-100 pt-5">
            <p className="text-sm font-medium text-[var(--color-text)]">Remarks</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text-muted)]">
              {history.remarks || "No remarks available."}
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">Class Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-text-muted)]">Code</dt>
                <dd className="font-medium text-[var(--color-text)]">{history.Class?.code || "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-text-muted)]">Category</dt>
                <dd className="text-right font-medium text-[var(--color-text)]">{history.Class?.category || "-"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--color-text-muted)]">Level</dt>
                <dd className="font-medium text-[var(--color-text)]">{history.Class?.level || "-"}</dd>
              </div>
            </dl>
          </section>

          {history.certificateUrl && (
            <a
              href={history.certificateUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-sm border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700 hover:bg-orange-100"
            >
              <Download size={16} /> View Certificate
            </a>
          )}
        </aside>
      </div>
    </div>
  );
};

export default HistoryClassDetail;
