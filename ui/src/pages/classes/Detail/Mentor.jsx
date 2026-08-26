import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import TabTable from "@/components/ui/tables/TabTable";

import useBreadcrumbs from "@/hooks/useBreadcrumbs";
import ClassService from "@/services/modules/class.service";

import {
  Eye,
  Download,
  Calendar,
  Users,
  CheckSquare,
  FileText,
  Archive,
} from "lucide-react";

import { formatDate } from "@/helpers";

const tabs = ["Meetings", "Mentees", "Tasks", "Notes", "Materials"];

const Mentor = () => {
  const { id } = useParams();
  const breadcrumbs = useBreadcrumbs([{ label: "Classes", to: "/classes" }]);

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Meetings");

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await ClassService.getById(+id);

        setClassData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [id]);

  if (loading) {
    return <div className="p-4 text-gray-500">Loading class...</div>;
  }

  if (!classData) {
    return <div className="p-4 text-red-500">Class not found</div>;
  }

  return (
    <div className="space-y-4 p-4">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">
        {breadcrumbs.map((b) => (
          <span key={b.to}>{b.label} / </span>
        ))}
        <span className="font-medium">{classData.code}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* LEFT */}
        <div className="rounded-sm border border-gray-200 bg-white p-5 lg:col-span-1">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-sm bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
              {classData.code}
            </span>

            <span
              className={`rounded-sm px-2 py-1 text-xs font-medium ${
                classData.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {classData.status}
            </span>

            <span className="rounded-sm bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
              {classData.category}
            </span>

            <span className="rounded-sm bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
              {classData.level}
            </span>
          </div>

          <h1 className="text-2xl font-bold">{classData.name}</h1>

          <p className="mt-3 text-sm text-gray-600">
            {classData.description || "-"}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Mentor</p>
              <p className="font-medium">{classData.mentor?.name || "-"}</p>
            </div>

            <div>
              <p className="text-gray-500">Created By</p>
              <p className="font-medium">{classData.creator?.name || "-"}</p>
            </div>

            <div>
              <p className="text-gray-500">Start Date</p>
              <p>
                {classData.startDate ? formatDate(classData.startDate) : "-"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">End Date</p>
              <p>{classData.endDate ? formatDate(classData.endDate) : "-"}</p>
            </div>
          </div>

          <div className="my-6">
            <h3 className="mb-4 text-lg font-semibold">Statistics</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Meetings</span>
                <span className="font-bold">
                  {classData.meetings?.length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Mentees</span>
                <span className="font-bold">
                  {classData.mentees?.length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Tasks</span>
                <span className="font-bold">
                  {classData.tasks?.length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Notes</span>
                <span className="font-bold">
                  {classData.notes?.length || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Materials</span>
                <span className="font-bold">
                  {classData.materials?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="rounded-sm border border-gray-200 bg-white p-5 lg:col-span-2">
          <div className="rounded-sm border border-gray-200 bg-white px-5">
            <div className="flex flex-wrap gap-6">
              {tabs.map((tab) => {
                const icons = {
                  Meetings: Calendar,
                  Mentees: Users,
                  Tasks: CheckSquare,
                  Notes: FileText,
                  Materials: Archive,
                };

                const Icon = icons[tab];

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-2 py-4 text-sm font-medium transition ${
                      activeTab === tab
                        ? "border-b-2 border-orange-500 text-orange-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon size={16} />
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meetings */}
          {activeTab === "Meetings" && (
            <div className="space-y-4">
              <TabTable
                data={classData.meetings || []}
                columns={[
                  {
                    key: "meetingNumber",
                    label: "#",
                  },
                  {
                    key: "name",
                    label: "Meeting",
                  },
                  {
                    key: "description",
                    label: "Description",
                  },
                  {
                    key: "meetingDate",
                    label: "Date",
                    render: (row) =>
                      row.meetingDate ? formatDate(row.meetingDate) : "-",
                  },
                  {
                    key: "actions",
                    label: "Actions",
                    render: (row) => (
                      <Link
                        to={`/meetings/${row.id}`}
                        className="inline-flex items-center gap-1 rounded-sm bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                      >
                        <Eye size={14} />
                        View
                      </Link>
                    ),
                  },
                ]}
              />
            </div>
          )}

          {/* Mentees */}
          {activeTab === "Mentees" && (
            <TabTable
              data={classData.mentees || []}
              columns={[
                {
                  key: "name",
                  label: "Mentee",
                  render: (row) => (
                    <div>
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs text-gray-500">{row.email}</p>
                    </div>
                  ),
                },
                {
                  key: "attendance",
                  label: "Attendance",
                  render: (row) => `${row.stats?.attendance ?? 0}%`,
                },
                {
                  key: "taskCompletion",
                  label: "Task Completion",
                  render: (row) => `${row.stats?.taskCompletion ?? 0}%`,
                },
                {
                  key: "avgScore",
                  label: "Avg. Score",
                  render: (row) => row.stats?.avgScore ?? 0,
                },
                {
                  key: "progress",
                  label: "Progress",
                  render: (row) => (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full rounded-full ${
                            (row.stats?.progress ?? 0) >= 70
                              ? "bg-green-500"
                              : (row.stats?.progress ?? 0) >= 40
                                ? "bg-orange-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${row.stats?.progress ?? 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {row.stats?.progress ?? 0}%
                      </span>
                    </div>
                  ),
                },
                {
                  key: "joinDate",
                  label: "Join Date",
                  render: (row) =>
                    row.ClassUser?.joinedAt
                      ? formatDate(row.ClassUser.joinedAt)
                      : "-",
                },
                {
                  key: "status",
                  label: "Status",
                  render: (row) => (
                    <span
                      className={`rounded-sm px-2 py-1 text-xs font-medium ${
                        row.ClassUser?.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {row.ClassUser?.status || "-"}
                    </span>
                  ),
                },
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) => (
                    <Link
                      to={`/mentees/${row.id}`}
                      className="inline-flex items-center gap-1 rounded-sm bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                    >
                      <Eye size={14} />
                      Details
                    </Link>
                  ),
                },
              ]}
            />
          )}

          {/* Tasks */}
          {activeTab === "Tasks" && (
            <div className="space-y-4">
              <TabTable
                data={classData.tasks || []}
                columns={[
                  {
                    key: "id",
                    label: "ID",
                  },
                  {
                    key: "name",
                    label: "Task",
                  },
                  {
                    key: "description",
                    label: "Description",
                  },
                  {
                    key: "maxScore",
                    label: "Max Score",
                  },
                  {
                    key: "dueDate",
                    label: "Due Date",
                    render: (row) =>
                      row.dueDate ? formatDate(row.dueDate) : "-",
                  },
                ]}
              />
            </div>
          )}

          {/* Notes */}
          {activeTab === "Notes" && (
            <div className="space-y-4">
              <TabTable
                data={classData.notes || []}
                columns={[
                  {
                    key: "id",
                    label: "ID",
                  },
                  {
                    key: "name",
                    label: "Name",
                  },
                  {
                    key: "description",
                    label: "Description",
                  },
                  {
                    key: "fileUrl",
                    label: "Attachment",
                    render: (row) =>
                      row.fileUrl ? (
                        <a
                          href={row.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-sm bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                        >
                          <Download size={12} />
                          Download
                        </a>
                      ) : (
                        "-"
                      ),
                  },
                ]}
              />
            </div>
          )}

          {/* Materials */}
          {activeTab === "Materials" && (
            <div className="space-y-4">
              <TabTable
                data={classData.materials || []}
                columns={[
                  {
                    key: "id",
                    label: "ID",
                  },
                  {
                    key: "name",
                    label: "Name",
                  },
                  {
                    key: "type",
                    label: "Type",
                  },
                  {
                    key: "description",
                    label: "Description",
                  },
                  {
                    key: "fileUrl",
                    label: "Attachment",
                    render: (row) =>
                      row.fileUrl ? (
                        <a
                          href={row.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-sm bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                        >
                          <Download size={12} />
                          Download
                        </a>
                      ) : (
                        "-"
                      ),
                  },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mentor;
