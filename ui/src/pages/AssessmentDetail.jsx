import { createElement, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  ClipboardCheck,
  MessageSquare,
  UserRound,
} from "lucide-react";

import usePopupStore from "@/app/store/popupStore";
import AssessmentResultService from "@/services/modules/assessmentResult.service";
import LoadingPage from "@/components/ui/loading/LoadingPage";
import Avatar from "@/components/ui/avatar/Avatar";
import Table from "@/components/ui/tables/Table";

const performance = (score) => {
  if (Number(score) >= 90) return { label: "Excellent", tone: "bg-green-100 text-green-700" };
  if (Number(score) >= 70) return { label: "On Track", tone: "bg-blue-100 text-blue-700" };
  return { label: "Needs Help", tone: "bg-red-100 text-red-700" };
};

const AssessmentDetail = () => {
  const { id } = useParams();
  const { openError } = usePopupStore();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await AssessmentResultService.getById(id);
        setResult(response.data);
      } catch (error) {
        openError({
          title: "Load Failed",
          message: error?.response?.data?.message || "Failed to load assessment result.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id, openError]);

  const status = useMemo(() => performance(result?.finalScore), [result?.finalScore]);

  if (loading) return <LoadingPage title="Loading Assessment..." />;

  if (!result) {
    return <p className="m-4 rounded-sm border border-red-200 bg-red-50 p-4 text-red-700">Assessment result not found.</p>;
  }

  const submission = result.TaskSubmission;
  const task = submission?.Task;

  const columns = [
    {
      key: "criteria",
      label: "Criteria",
      render: (score) => (
        <div>
          <p className="font-medium">{score.criteria?.title || "-"}</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {score.criteria?.description || "No description"}
          </p>
        </div>
      ),
    },
    {
      key: "score",
      label: "Score",
      render: (score) => `${score.score ?? 0} / ${score.criteria?.maxScore ?? "-"}`,
    },
    { key: "note", label: "Assessor Note", render: (score) => score.note || "-" },
  ];

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <Link to="/assessments" className="inline-flex items-center gap-2 rounded-sm border border-gray-200 bg-[var(--color-surface)] px-3 py-2 text-sm font-medium hover:bg-gray-50">
        <ArrowLeft size={16} /> Back to Assessments
      </Link>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="space-y-4 xl:col-span-2">
          <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
            <p className="text-xs font-semibold uppercase text-[var(--color-primary)]">Assessment Result</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar name={submission?.User?.name} size="md" />
                <div>
                  <h1 className="text-xl font-semibold">{submission?.User?.name || "-"}</h1>
                  <p className="text-sm text-[var(--color-text-muted)]">{task?.name || "-"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[var(--color-primary)]">{result.finalScore ?? 0}</p>
                <span className={`mt-1 inline-block rounded-sm px-2 py-1 text-xs font-medium ${status.tone}`}>{status.label}</span>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
            <h2 className="text-base font-semibold">Criteria Scores</h2>
            <div className="mt-4">
              <Table columns={columns} data={result.scores || []} />
            </div>
          </div>

          <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
            <div className="flex items-center gap-2">
              <MessageSquare size={17} className="text-[var(--color-primary)]" />
              <h2 className="text-base font-semibold">Mentor Feedback</h2>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text-muted)]">
              {result.mentorFeedback || "No feedback was provided."}
            </p>
          </div>
        </section>

        <aside className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
          <h2 className="text-base font-semibold">Assessment Details</h2>
          <div className="mt-4 space-y-4">
            <DetailItem icon={ClipboardCheck} label="Class" value={task?.Class?.name || "-"} />
            <DetailItem icon={CalendarDays} label="Meeting" value={task?.Meeting?.name || "-"} />
            <DetailItem icon={UserRound} label="Graded By" value={result.grader?.name || "-"} />
            <DetailItem icon={CalendarDays} label="Graded At" value={result.gradedAt ? new Date(result.gradedAt).toLocaleString("id-ID") : "-"} />
            <DetailItem icon={Award} label="Task Maximum" value={task?.maxScore ?? "-"} />
          </div>
        </aside>
      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <div className="flex gap-2">
    {createElement(icon, {
      size: 16,
      className: "mt-0.5 shrink-0 text-[var(--color-text-muted)]",
    })}
    <div>
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  </div>
);

export default AssessmentDetail;
