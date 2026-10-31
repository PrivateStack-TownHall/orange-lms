import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  Award,
  BookOpen,
  Calendar,
  Users,
  FileText,
  Info,
  Paperclip,
} from "lucide-react";

import { formatDate, can } from "@/helpers";

import TaskService from "@/services/modules/task.service";

import ActionButton from "@/components/ui/buttons/ActionButton";
import LoadingPage from "@/components/ui/loading/LoadingPage";
import StatusBadge from "@/components/ui/status/StatusBadge";

import TaskCriteriaSection from "./components/TaskCriteriaSection";
import SubmissionsTab from "@/pages/meetings/Detail/components/SubmissionsTab";
import SubmitTaskModal from "@/pages/meetings/Detail/components/SubmitTaskModal";

/**
 * Dual-mode component:
 *  - Modal mode: rendered from the Tasks list with a `task` prop already in hand.
 *  - Route mode (/tasks/:id): no `task` prop is passed, so it fetches itself.
 */
const Detail = ({ task: taskProp, role: roleProp, onDelete }) => {
  const { id } = useParams();
  const user = useSelector((state) => state.auth.user);
  const role = roleProp || user?.role;

  const [task, setTask] = useState(taskProp || null);
  const [loading, setLoading] = useState(!taskProp && !!id);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (taskProp || !id) return;

    const fetchTask = async () => {
      try {
        const res = await TaskService.getById(id);
        setTask(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <LoadingPage title="Loading Task..." />;
  }

  if (!task) return null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-sm bg-orange-100">
              <Award size={40} className="text-orange-600" />
            </div>

            <h2 className="mt-4 text-lg font-bold">{task.name}</h2>

            <div className="mt-2 flex items-center gap-2 text-xs">
              <StatusBadge status={task.status} />
              <span className="text-[var(--color-text-muted)]">
                TASK-{String(task.id).padStart(4, "0")}
              </span>
            </div>

            <div className="mt-5 w-full space-y-4 text-left text-sm">
              <SidebarField icon={BookOpen} label="Class">
                {task.Class?.code} - {task.Class?.name}
              </SidebarField>

              <SidebarField icon={Users} label="Meeting">
                Meeting #{task.Meeting?.meetingNumber} - {task.Meeting?.name}
              </SidebarField>

              <SidebarField icon={Award} label="Max Score">
                {task.maxScore ?? "-"}
              </SidebarField>

              <SidebarField icon={Calendar} label="Due Date">
                {task.dueDate ? formatDate(task.dueDate) : "-"}
              </SidebarField>

              <SidebarField icon={Users} label="Created By">
                {task.creator?.name || "-"}
              </SidebarField>
            </div>

            <div className="mt-5 flex w-full gap-2">
              {can(role, "task", "update") && (
                <Link to={`/tasks/edit/${task.id}`} className="flex-1">
                  <ActionButton
                    action="edit"
                    className="w-full justify-center py-2"
                  />
                </Link>
              )}

              {can(role, "task", "delete") && (
                <ActionButton
                  action="delete"
                  className="flex-1 justify-center py-2"
                  onClick={() => onDelete?.(task.id)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 lg:col-span-3">
        <InfoCard icon={FileText} title="Description">
          <p className="text-sm leading-6 text-gray-600">
            {task.description || "-"}
          </p>
        </InfoCard>

        <div className="rounded-sm border border-amber-100 bg-amber-50 p-5">
          <div className="mb-2 flex items-center gap-2">
            <Info size={18} className="text-amber-500" />
            <span className="font-semibold text-amber-800">Assessment</span>
          </div>
          <p className="text-sm leading-6 text-amber-700">
            This task will be assessed by the mentor based on the criteria set
            for this class. Make sure all instructions are followed to get the
            maximum score.
          </p>
        </div>

        <InfoCard icon={Paperclip} title="Attachment">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Download task attachment if available
            </p>
            {task.fileUrl ? (
              <ActionButton action="download" href={task.fileUrl}>
                Download File
              </ActionButton>
            ) : (
              <span className="text-sm text-gray-500">No attachment</span>
            )}
          </div>
        </InfoCard>

        <TaskCriteriaSection taskId={task.id} role={role} />

        {can(role, "task", "submit") && (
          <div className="rounded-sm border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Your Submission</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Submit your work before the deadline.
                </p>
              </div>
              <button
                onClick={() => setSubmitting(true)}
                className="rounded-sm bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
              >
                Submit / Resubmit
              </button>
            </div>
          </div>
        )}

        {(can(role, "taskCriteria", "create") ||
          role === "Owner" ||
          role === "Admin") && (
          <div className="rounded-sm border border-gray-200 bg-white p-5">
            <h3 className="mb-3 font-semibold">Submissions</h3>
            <SubmissionsTab tasks={[task]} />
          </div>
        )}
      </div>

      <SubmitTaskModal
        open={submitting}
        task={task}
        onClose={() => setSubmitting(false)}
        onSubmitted={() => setSubmitting(false)}
      />
    </div>
  );
};

const SidebarField = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-2">
    <Icon
      size={15}
      className="mt-0.5 shrink-0 text-[var(--color-text-muted)]"
    />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <div className="font-medium">{children}</div>
    </div>
  </div>
);

const InfoCard = ({ icon: Icon, title, children }) => (
  <div className="rounded-sm border border-gray-200 bg-white p-5">
    <div className="mb-3 flex items-center gap-2">
      <Icon size={18} className="text-orange-500" />
      <h3 className="font-semibold">{title}</h3>
    </div>
    {children}
  </div>
);

export default Detail;
