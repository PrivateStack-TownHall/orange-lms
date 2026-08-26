import { useEffect, useMemo, useState } from "react";
import { Award, Save, Send } from "lucide-react";

import PopUp from "@/components/ui/popup/PopUp";

import TaskCriteriaService from "@/services/modules/taskCriteria.service";
import AssessmentResultService from "@/services/modules/assessmentResult.service";
import SubmissionCriteriaScoreService from "@/services/modules/submissionCriteriaScore.service";

/**
 * Grade Submission modal.
 * Lets a mentor score a submission per task-criteria, save as draft, or
 * publish (which notifies the mentee and flips submission status to Graded).
 */
const GradeSubmissionModal = ({ open, submission, onClose, onSaved }) => {
  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState({}); // { [criteriaId]: { score, note } }
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const existingResult = submission?.AssessmentResult;

  useEffect(() => {
    if (!open || !submission) return;

    const fetchCriteria = async () => {
      try {
        setLoading(true);
        const res = await TaskCriteriaService.getByTask(submission.TaskId);
        setCriteria(res.data || []);

        const initialScores = {};
        (existingResult?.scores || []).forEach((s) => {
          initialScores[s.TaskCriteriaId] = {
            score: s.score,
            note: s.note || "",
          };
        });
        setScores(initialScores);
        setFeedback(existingResult?.mentorFeedback || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCriteria();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, submission?.id]);

  const totalWeighted = useMemo(() => {
    return criteria.reduce((sum, c) => {
      const raw = Number(scores[c.id]?.score || 0);
      const max = Number(c.maxScore || 100);
      const weight = Number(c.percentage || 0);
      return sum + (max > 0 ? (raw / max) * weight : 0);
    }, 0);
  }, [criteria, scores]);

  const setCriteriaScore = (criteriaId, field, value) => {
    setScores((prev) => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], [field]: value },
    }));
  };

  const handleSave = async (isDraft) => {
    try {
      setSaving(true);

      let assessmentResult = existingResult;

      const payload = {
        TaskSubmissionId: submission.id,
        finalScore: Number(totalWeighted.toFixed(2)),
        mentorFeedback: feedback,
        isDraft,
      };

      if (assessmentResult?.id) {
        const res = await AssessmentResultService.update(
          assessmentResult.id,
          payload,
        );
        assessmentResult = res.data;
      } else {
        const res = await AssessmentResultService.create(payload);
        assessmentResult = res.data;
      }

      // Sync per-criteria scores
      for (const c of criteria) {
        const entry = scores[c.id];
        if (!entry || entry.score === undefined || entry.score === "") continue;

        const existingScore = (existingResult?.scores || []).find(
          (s) => s.TaskCriteriaId === c.id,
        );

        if (existingScore) {
          await SubmissionCriteriaScoreService.update(existingScore.id, {
            score: Number(entry.score),
            note: entry.note || null,
          });
        } else {
          await SubmissionCriteriaScoreService.create({
            AssessmentResultId: assessmentResult.id,
            TaskCriteriaId: c.id,
            score: Number(entry.score),
            note: entry.note || null,
          });
        }
      }

      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!submission) return null;

  return (
    <PopUp
      open={open}
      onClose={onClose}
      title="Grade Submission"
      width="max-w-3xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-sm border border-gray-200 bg-gray-50 p-3">
          <div>
            <p className="font-medium">{submission.User?.name}</p>
            <p className="text-xs text-gray-500">{submission.User?.email}</p>
          </div>
          <span className="rounded-sm bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
            {submission.status}
          </span>
        </div>

        {loading ? (
          <p className="py-6 text-center text-sm text-gray-500">
            Loading criteria...
          </p>
        ) : criteria.length === 0 ? (
          <div className="rounded-sm border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            No task criteria defined yet. Add criteria on the Task Detail page
            first.
          </div>
        ) : (
          <div className="space-y-3">
            {criteria.map((c) => (
              <div key={c.id} className="rounded-sm border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{c.title}</p>
                    {c.description && (
                      <p className="text-xs text-gray-500">{c.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    Weight {c.percentage}%
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-[100px_1fr] items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={c.maxScore}
                    value={scores[c.id]?.score ?? ""}
                    onChange={(e) =>
                      setCriteriaScore(c.id, "score", e.target.value)
                    }
                    placeholder={`0-${c.maxScore}`}
                    className="rounded-sm border border-gray-200 px-2 py-1.5 text-sm"
                  />
                  <input
                    type="text"
                    value={scores[c.id]?.note ?? ""}
                    onChange={(e) =>
                      setCriteriaScore(c.id, "note", e.target.value)
                    }
                    placeholder="Note (optional)"
                    className="rounded-sm border border-gray-200 px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between rounded-sm bg-orange-50 p-3">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-orange-600" />
                <span className="font-semibold text-orange-800">
                  Total Score
                </span>
              </div>
              <span className="text-lg font-bold text-orange-700">
                {totalWeighted.toFixed(1)} / 100
              </span>
            </div>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium">
            Feedback for Mentee
          </label>
          <textarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full rounded-sm border border-gray-200 p-3 text-sm"
            placeholder="Write feedback for the mentee..."
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
          <button
            onClick={onClose}
            className="rounded-sm border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            disabled={saving || criteria.length === 0}
            onClick={() => handleSave(true)}
            className="inline-flex items-center gap-2 rounded-sm border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-50"
          >
            <Save size={14} />
            Save as Draft
          </button>
          <button
            disabled={saving || criteria.length === 0}
            onClick={() => handleSave(false)}
            className="inline-flex items-center gap-2 rounded-sm bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            <Send size={14} />
            Save & Publish
          </button>
        </div>
      </div>
    </PopUp>
  );
};

export default GradeSubmissionModal;
