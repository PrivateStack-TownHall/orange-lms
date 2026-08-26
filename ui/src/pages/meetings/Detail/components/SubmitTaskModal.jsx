import { useState } from "react";
import { UploadCloud } from "lucide-react";

import PopUp from "@/components/ui/popup/PopUp";
import TaskService from "@/services/modules/task.service";

/**
 * Lets a mentee submit (or resubmit) their work for a task: a link
 * (GitHub repo, Figma, deployed URL, etc.) plus an optional note.
 */
const SubmitTaskModal = ({ open, task, onClose, onSubmitted }) => {
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submittedNote, setSubmittedNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!submissionUrl.trim()) {
      setError("Please provide a link to your work.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await TaskService.submit(task.id, { submissionUrl, submittedNote });
      setSubmissionUrl("");
      setSubmittedNote("");
      onSubmitted?.();
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit task.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!task) return null;

  return (
    <PopUp open={open} onClose={onClose} title="Submit Task" width="max-w-lg">
      <div className="space-y-4">
        <div className="flex flex-col items-center rounded-sm bg-orange-50 p-6 text-center">
          <img
            src="/cloud-upload.png"
            alt=""
            className="h-16 w-16 object-contain"
          />
          <p className="mt-2 font-semibold">{task.name}</p>
          <p className="text-xs text-gray-500">
            Submit your work before the deadline.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Submission Link <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={submissionUrl}
            onChange={(e) => setSubmissionUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
            className="w-full rounded-sm border border-gray-200 p-3 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Submission Note
          </label>
          <textarea
            rows={3}
            value={submittedNote}
            onChange={(e) => setSubmittedNote(e.target.value)}
            placeholder="Any notes for your mentor..."
            className="w-full rounded-sm border border-gray-200 p-3 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
          <button
            onClick={onClose}
            className="rounded-sm border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            disabled={submitting}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-sm bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
          >
            <UploadCloud size={14} />
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </PopUp>
  );
};

export default SubmitTaskModal;
