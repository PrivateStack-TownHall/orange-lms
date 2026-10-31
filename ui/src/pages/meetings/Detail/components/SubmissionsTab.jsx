import { useEffect, useState } from "react";
import { ClipboardCheck, Eye } from "lucide-react";

import TaskService from "@/services/modules/task.service";

import GradeSubmissionModal from "@/pages/tasks/components/GradeSubmissionModal";

const STATUS_STYLE = {
  Submitted: "bg-blue-100 text-blue-700",
  "Under Review": "bg-amber-100 text-amber-700",
  Graded: "bg-green-100 text-green-700",
  Reviewed: "bg-green-100 text-green-700",
  Late: "bg-red-100 text-red-700",
  Resubmitted: "bg-purple-100 text-purple-700",
};

/**
 * Submission tab for a Meeting Detail page (Mentor/Admin view).
 * Lists every task in the meeting, and — once a task is selected — every
 * mentee submission for it, with a Grade action.
 */
const SubmissionsTab = ({ tasks = [] }) => {
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?.id || null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState(null);

  const fetchSubmissions = async (taskId) => {
    if (!taskId) return;
    try {
      setLoading(true);
      const res = await TaskService.getSubmissions(taskId);
      setSubmissions(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(selectedTaskId);
  }, [selectedTaskId]);

  if (tasks.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        No tasks in this meeting yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Task selector */}
      <div className="flex flex-wrap gap-2">
        {tasks.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTaskId(t.id)}
            className={`rounded-sm px-3 py-1.5 text-xs font-medium transition ${
              selectedTaskId === t.id
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Submissions table */}
      <div className="overflow-hidden rounded-sm border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Mentee</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted At</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Loading submissions...
                </td>
              </tr>
            ) : submissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No submissions yet for this task.
                </td>
              </tr>
            ) : (
              submissions.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.User?.name}</p>
                    <p className="text-xs text-gray-500">{s.User?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-sm px-2 py-1 text-xs font-medium ${STATUS_STYLE[s.status] || "bg-gray-100 text-gray-600"}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {s.submittedAt
                      ? new Date(s.submittedAt).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {s.AssessmentResult?.finalScore ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setGrading(s)}
                      className="inline-flex items-center gap-1 rounded-sm bg-orange-100 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-200"
                    >
                      {s.AssessmentResult ? (
                        <>
                          <Eye size={12} />
                          View / Edit Grade
                        </>
                      ) : (
                        <>
                          <ClipboardCheck size={12} />
                          Grade
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <GradeSubmissionModal
        open={!!grading}
        submission={grading}
        onClose={() => setGrading(null)}
        onSaved={() => fetchSubmissions(selectedTaskId)}
      />
    </div>
  );
};

export default SubmissionsTab;
