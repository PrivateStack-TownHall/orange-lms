import { createElement, useEffect, useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  CircleAlert,
  Edit2,
  Plus,
  Target,
  Trash2,
} from "lucide-react";

import PopUp from "@/components/ui/popup/PopUp";
import TaskCriteriaService from "@/services/modules/taskCriteria.service";
import { can } from "@/helpers";
import usePopupStore from "@/app/store/popupStore";

const emptyForm = { title: "", percentage: "", maxScore: "", description: "" };

/**
 * Task Criteria section for the Task Detail page.
 * Mentor/Admin/Owner can add, edit, and delete grading criteria; the total
 * weight must sum to 100% before it's usable for grading (enforced by the
 * backend, mirrored here for a snappier error).
 */
const TaskCriteriaSection = ({ taskId, role }) => {
  const [criteria, setCriteria] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { openConfirm } = usePopupStore();

  const canManage = can(role, "taskCriteria", "create");

  const fetchCriteria = async () => {
    try {
      setLoading(true);
      const [criteriaResponse, summaryResponse] = await Promise.all([
        TaskCriteriaService.getByTask(taskId),
        TaskCriteriaService.getSummary(taskId),
      ]);
      setCriteria(criteriaResponse.data || []);
      setSummary(summaryResponse.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) fetchCriteria();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const totalWeight = useMemo(
    () =>
      summary?.totalPercentage ??
      criteria.reduce((sum, item) => sum + Number(item.percentage || 0), 0),
    [criteria, summary],
  );

  const availableWeight = useMemo(() => {
    const editingWeight = Number(editing?.percentage || 0);
    return Math.max(0, 100 - (Number(totalWeight) - editingWeight));
  }, [editing?.percentage, totalWeight]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      title: c.title,
      percentage: c.percentage,
      maxScore: c.maxScore,
      description: c.description || "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.percentage || !form.maxScore) {
      setError("Title, weight, and max score are required.");
      return;
    }

    const percentage = Number(form.percentage);

    if (percentage <= 0 || percentage > availableWeight) {
      setError(`Weight must be between 1% and ${availableWeight}%.`);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        TaskId: taskId,
        title: form.title,
        percentage,
        maxScore: Number(form.maxScore),
        description: form.description || null,
      };

      if (editing) {
        await TaskCriteriaService.update(editing.id, payload);
      } else {
        await TaskCriteriaService.create(payload);
      }

      setModalOpen(false);
      await fetchCriteria();
    } catch (err) {
      setError(
        err?.response?.data?.message?.[0] ||
          err?.response?.data?.message ||
          "Failed to save criteria.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    openConfirm({
      title: "Delete Criteria",
      message: "This criterion will be removed from the task assessment.",
      action: async () => {
        await TaskCriteriaService.delete(id);
        await fetchCriteria();
      },
    });
  };

  return (
    <div className="rounded-sm border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-orange-500" />
          <h3 className="font-semibold">Task Criteria</h3>
          {criteria.length > 0 && (
            <span
              className={`rounded-sm px-2 py-0.5 text-xs font-medium ${
                totalWeight === 100
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {totalWeight}% weight
            </span>
          )}
        </div>

        {canManage && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1 rounded-sm bg-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600"
          >
            <Plus size={14} />
            Add Criteria
          </button>
        )}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryStat
          icon={Award}
          label="Criteria"
          value={summary?.totalCriteria ?? criteria.length}
          tone="purple"
        />
        <SummaryStat
          icon={Target}
          label="Max Score"
          value={summary?.totalMaxScore ?? 0}
          tone="blue"
        />
        <div
          className={`rounded-sm border p-3 ${
            totalWeight === 100
              ? "border-green-200 bg-green-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <div className="flex items-center gap-2">
            {totalWeight === 100 ? (
              <CheckCircle2 size={17} className="text-green-600" />
            ) : (
              <CircleAlert size={17} className="text-amber-600" />
            )}
            <p
              className={`text-sm font-semibold ${
                totalWeight === 100 ? "text-green-800" : "text-amber-800"
              }`}
            >
              {totalWeight === 100 ? "Ready to grade" : "Weight needs review"}
            </p>
          </div>
          <p
            className={`mt-1 text-xs ${
              totalWeight === 100 ? "text-green-700" : "text-amber-700"
            }`}
          >
            {totalWeight}% of 100% configured.
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="h-2 overflow-hidden rounded-sm bg-gray-100">
          <div
            className={totalWeight === 100 ? "h-full bg-green-500" : "h-full bg-orange-500"}
            style={{ width: `${Math.min(Number(totalWeight), 100)}%` }}
          />
        </div>
      </div>

      {loading ? (
        <p className="py-4 text-center text-sm text-gray-500">Loading...</p>
      ) : criteria.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <img
            src="/score-calculator-grade.png"
            alt=""
            className="h-14 w-14 object-contain opacity-70"
          />
          <p className="mt-2 text-sm text-gray-500">
            No grading criteria set up yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {criteria.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-sm border border-gray-200 p-3"
            >
              <div>
                <p className="font-medium">{c.title}</p>
                {c.description && (
                  <p className="text-xs text-gray-500">{c.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-orange-600">
                  {c.percentage}%
                </span>
                <span className="text-xs text-gray-400">max {c.maxScore}</span>
                {canManage && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(c)}
                      className="rounded-sm p-1.5 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="rounded-sm p-1.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <PopUp
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Criteria" : "Add Task Criteria"}
        width="max-w-md"
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Criteria Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="e.g. UI Implementation"
              className="w-full rounded-sm border border-gray-200 p-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Weight (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={availableWeight}
                value={form.percentage}
                onChange={(e) =>
                  setForm((f) => ({ ...f, percentage: e.target.value }))
                }
                className="w-full rounded-sm border border-gray-200 p-2.5 text-sm"
              />
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Up to {availableWeight}% available.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Max Score <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={form.maxScore}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxScore: e.target.value }))
                }
                className="w-full rounded-sm border border-gray-200 p-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full rounded-sm border border-gray-200 p-2.5 text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 border-t border-gray-200 pt-3">
            <button
              onClick={() => setModalOpen(false)}
              className="rounded-sm border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              onClick={handleSave}
              className="rounded-sm bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Criteria"}
            </button>
          </div>
        </div>
      </PopUp>
    </div>
  );
};

const SummaryStat = ({ icon, label, value, tone }) => (
  <div className="flex items-center gap-3 rounded-sm border border-gray-100 bg-gray-50 p-3">
    <div
      className={`rounded-sm p-2 ${
        tone === "purple"
          ? "bg-purple-100 text-purple-600"
          : "bg-blue-100 text-blue-600"
      }`}
    >
      {createElement(icon, { size: 17 })}
    </div>
    <div>
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  </div>
);

export default TaskCriteriaSection;
