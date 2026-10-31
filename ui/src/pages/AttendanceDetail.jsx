import { createElement, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ExternalLink,
  Save,
  Upload,
  UserRound,
} from "lucide-react";

import usePopupStore from "@/app/store/popupStore";
import AttendanceService from "@/services/modules/attendance.service";
import { can, formatDate } from "@/helpers";
import LoadingPage from "@/components/ui/loading/LoadingPage";
import Avatar from "@/components/ui/avatar/Avatar";
import Button from "@/components/ui/buttons/Button";

const STATUS_OPTIONS = ["Present", "Late", "Absent", "Excused"];
const STATUS_TONE = {
  Present: "bg-green-100 text-green-700",
  Late: "bg-amber-100 text-amber-700",
  Absent: "bg-red-100 text-red-700",
  Excused: "bg-blue-100 text-blue-700",
};

const AttendanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = useSelector((state) => state.auth.user?.role);
  const { openError, openSuccess } = usePopupStore();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("Present");
  const [notes, setNotes] = useState("");
  const [evidence, setEvidence] = useState(null);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await AttendanceService.getById(id);
        const data = response.data;
        setRecord(data);
        setStatus(data.status);
        setNotes(data.notes || "");
      } catch (error) {
        openError({
          title: "Load Failed",
          message: error?.response?.data?.message || "Failed to load attendance.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id, openError]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = new FormData();
      payload.append("status", status);
      payload.append("notes", notes);
      if (evidence) payload.append("evidence", evidence);

      const response = await AttendanceService.update(id, payload);
      setRecord(response.data);
      setEvidence(null);
      openSuccess({
        title: "Attendance Updated",
        message: "Attendance details were saved successfully.",
      });
    } catch (error) {
      openError({
        title: "Save Failed",
        message: error?.response?.data?.message || "Failed to update attendance.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingPage title="Loading Attendance..." />;

  if (!record) {
    return <p className="m-4 rounded-sm border border-red-200 bg-red-50 p-4 text-red-700">Attendance record not found.</p>;
  }

  const canUpdate = can(role, "attendance", "update");

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <Link to="/attendance" className="inline-flex items-center gap-2 rounded-sm border border-gray-200 bg-[var(--color-surface)] px-3 py-2 text-sm font-medium hover:bg-gray-50">
        <ArrowLeft size={16} /> Back to Attendance
      </Link>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="space-y-4 xl:col-span-2">
          <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
            <p className="text-xs font-semibold uppercase text-[var(--color-primary)]">Attendance Record</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar name={record.User?.name} size="md" />
                <div>
                  <h1 className="text-xl font-semibold">{record.User?.name}</h1>
                  <p className="text-sm text-[var(--color-text-muted)]">{record.User?.email || "-"}</p>
                </div>
              </div>
              <span className={`rounded-sm px-3 py-1.5 text-sm font-semibold ${STATUS_TONE[record.status]}`}>{record.status}</span>
            </div>
          </div>

          <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
            <h2 className="text-base font-semibold">Evidence</h2>
            {record.evidenceUrl ? (
              <a
                href={record.evidenceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-sm border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50"
              >
                <ExternalLink size={16} /> Open evidence
              </a>
            ) : (
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                No evidence was uploaded for this record.
              </p>
            )}
          </div>

          <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
            <h2 className="text-base font-semibold">Attendance Details</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField icon={CalendarDays} label="Meeting">{record.Meeting?.name || "-"}</DetailField>
              <DetailField icon={UserRound} label="Class">{record.Meeting?.class?.name || "-"}</DetailField>
              <DetailField icon={CalendarDays} label="Meeting Date">{record.Meeting?.meetingDate ? formatDate(record.Meeting.meetingDate) : "-"}</DetailField>
              <DetailField icon={Clock3} label="Check-in">{record.checkInAt ? new Date(record.checkInAt).toLocaleString("id-ID") : "-"}</DetailField>
              <DetailField icon={UserRound} label="Marked By">{record.checker?.name || "-"}</DetailField>
            </dl>
          </div>
        </section>

        <aside className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
          <h2 className="text-base font-semibold">{canUpdate ? "Update Attendance" : "Notes"}</h2>
          {canUpdate ? (
            <div className="mt-4 space-y-4">
              <label className="block text-sm font-medium">
                Status
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1.5 w-full rounded-sm border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400">
                  {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium">
                Notes
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} maxLength={500} placeholder="Add an attendance note..." className="mt-1.5 w-full resize-y rounded-sm border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400" />
              </label>
              <label className="block text-sm font-medium">
                Evidence
                <span className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-sm border border-dashed border-gray-300 px-3 py-2 text-sm font-normal text-[var(--color-text-muted)] hover:border-orange-400 hover:text-[var(--color-primary)]">
                  <Upload size={16} />
                  <span className="truncate">
                    {evidence?.name || "Choose JPG, PNG, or PDF"}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,application/pdf"
                    className="hidden"
                    onChange={(event) => setEvidence(event.target.files?.[0] || null)}
                  />
                </span>
              </label>
              <Button className="w-full" onClick={handleSave} disabled={saving}>
                <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">{record.notes || "No notes were added for this attendance record."}</p>
          )}

          {record.Meeting?.id && role !== "Mentee" && (
            <button type="button" onClick={() => navigate(`/meetings/${record.Meeting.id}`)} className="mt-4 w-full rounded-sm border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50">
              Open Meeting
            </button>
          )}
        </aside>
      </div>
    </div>
  );
};

const DetailField = ({ icon, label, children }) => (
  <div className="flex gap-2">
    {createElement(icon, {
      size: 16,
      className: "mt-0.5 shrink-0 text-[var(--color-text-muted)]",
    })}
    <div>
      <dt className="text-xs text-[var(--color-text-muted)]">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{children}</dd>
    </div>
  </div>
);

export default AttendanceDetail;
