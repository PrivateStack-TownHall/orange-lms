import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import TabTable from "@/components/ui/tables/TabTable";
import Popup from "@/components/ui/popup/PopUp";
import useBreadcrumbs from "@/hooks/useBreadcrumbs";

import MeetingService from "@/services/modules/meeting.service";

import {
  Calendar,
  CheckSquare,
  FileText,
  Archive,
  Send,
  Trash2,
} from "lucide-react";

import { formatDate } from "@/helpers";

import Form from "@/components/ui/forms/Form";

import useForm from "@/hooks/useForm";

import { taskSchema, noteSchema, materialSchema } from "@/schemas";

import TaskService from "@/services/modules/task.service";
import NoteService from "@/services/modules/note.service";
import MaterialService from "@/services/modules/material.service";

import AttendanceTab from "./components/AttendanceTab";
import SubmissionsTab from "./components/SubmissionsTab";

const tabs = ["Tasks", "Notes", "Materials", "Attendance", "Submission"];

const Mentor = () => {
  const { id } = useParams();
  const breadcrumbs = useBreadcrumbs([
    {
      label: "Meetings",
      to: "/meetings",
    },
  ]);
  const [meeting, setMeeting] = useState(null);

  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("Tasks");

  const [openTaskPopup, setOpenTaskPopup] = useState(false);
  const [openNotePopup, setOpenNotePopup] = useState(false);
  const [openMaterialPopup, setOpenMaterialPopup] = useState(false);

  const { values: taskValues, handleChange: handleTaskChange } = useForm(
    taskSchema.filter(
      (field) => !["ClassId", "MeetingId"].includes(field.name),
    ),
  );

  const { values: noteValues, handleChange: handleNoteChange } = useForm(
    noteSchema.filter(
      (field) => !["ClassId", "MeetingId"].includes(field.name),
    ),
  );

  const { values: materialValues, handleChange: handleMaterialChange } =
    useForm(
      materialSchema.filter(
        (field) => !["ClassId", "MeetingId"].includes(field.name),
      ),
    );

  // Create
  const handleCreateTask = async (data) => {
    try {
      await TaskService.createTaskByMeeting(meeting.id, data);

      await fetchMeeting();
      setOpenTaskPopup(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateNote = async (data) => {
    try {
      await NoteService.createNoteByMeeting(meeting.id, data);

      await fetchMeeting();
      setOpenNotePopup(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateMaterial = async (data) => {
    try {
      await MaterialService.createMaterialByMeeting(meeting.id, data);

      await fetchMeeting();
      setOpenMaterialPopup(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Delete
  const handleDeleteTask = async (taskId) => {
    try {
      await TaskService.delete(taskId);

      await fetchMeeting();
    } catch (error) {
      console.error(error);
    }
  };
  const handleDeleteNote = async (noteId) => {
    try {
      await NoteService.delete(noteId);

      await fetchMeeting();
    } catch (error) {
      console.error(error);
    }
  };
  const handleDeleteMaterial = async (materialId) => {
    try {
      await MaterialService.delete(materialId);

      await fetchMeeting();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMeeting = async () => {
    try {
      setLoading(true);

      const res = await MeetingService.getById(id);

      setMeeting(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeeting();
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-sm border border-gray-200 bg-white p-6">
        Loading meeting...
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="rounded-sm border border-red-200 bg-red-50 p-6 text-red-600">
        Meeting not found
      </div>
    );
  }
  return (
    <div className="space-y-4 p-4">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500">
        {breadcrumbs.map((b, i) => (
          <span key={b.to}>
            {b.label}
            {i < breadcrumbs.length - 1 && " / "}
          </span>
        ))}

        <span className="font-medium text-gray-700">
          {" / "}
          {meeting.name}
        </span>
      </div>

      {/* Content */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* LEFT */}
        <div className="space-y-5 lg:col-span-4">
          <Hero meeting={meeting} />

          <Statistics meeting={meeting} />
        </div>

        {/* RIGHT */}
        <div className="space-y-5 lg:col-span-8">
          <TabsHeader activeTab={activeTab} setActiveTab={setActiveTab} />

          <TabsContent
            activeTab={activeTab}
            meeting={meeting}
            setOpenTaskPopup={setOpenTaskPopup}
            setOpenNotePopup={setOpenNotePopup}
            setOpenMaterialPopup={setOpenMaterialPopup}
            handleDeleteTask={handleDeleteTask}
            handleDeleteNote={handleDeleteNote}
            handleDeleteMaterial={handleDeleteMaterial}
          />
        </div>
      </div>

      {/* Popups */}
      <Popup
        open={openTaskPopup}
        onClose={() => setOpenTaskPopup(false)}
        title="Create Task"
      >
        <Form
          title=""
          schema={taskSchema.filter(
            (field) => !["ClassId", "MeetingId"].includes(field.name),
          )}
          values={taskValues}
          onChange={handleTaskChange}
          onSubmit={handleCreateTask}
          submitLabel="Create Task"
        />
      </Popup>

      <Popup
        open={openNotePopup}
        onClose={() => setOpenNotePopup(false)}
        title="Create Note"
      >
        <Form
          title=""
          schema={noteSchema.filter(
            (field) => !["ClassId", "MeetingId"].includes(field.name),
          )}
          values={noteValues}
          onChange={handleNoteChange}
          onSubmit={handleCreateNote}
          submitLabel="Create Note"
        />
      </Popup>

      <Popup
        open={openMaterialPopup}
        onClose={() => setOpenMaterialPopup(false)}
        title="Create Material"
      >
        <Form
          title=""
          schema={materialSchema.filter(
            (field) => !["ClassId", "MeetingId"].includes(field.name),
          )}
          values={materialValues}
          onChange={handleMaterialChange}
          onSubmit={handleCreateMaterial}
          submitLabel="Create Material"
        />
      </Popup>
    </div>
  );
};

export default Mentor;

const Hero = ({ meeting }) => {
  return (
    <div className="rounded-sm border border-gray-200 bg-white p-6">
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="rounded-sm bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
          Meeting #{meeting.meetingNumber}
        </span>

        <span className="rounded-sm bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
          {meeting.class?.code}
        </span>
      </div>

      <h1 className="text-2xl font-bold">{meeting.name}</h1>

      <p className="mt-3 text-sm text-gray-600">{meeting.description}</p>

      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <p className="text-xs text-gray-500">Class</p>
          <p className="font-medium">{meeting.class?.name}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Date</p>
          <p className="font-medium">{formatDate(meeting.meetingDate)}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Start</p>
          <p className="font-medium">{meeting.startHour}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Finish</p>
          <p className="font-medium">{meeting.finishHour}</p>
        </div>
      </div>
    </div>
  );
};

const Statistics = ({ meeting }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-sm border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <CheckSquare size={20} />
          <span className="text-2xl font-bold">
            {meeting.tasks?.length || 0}
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-500">Tasks</p>
      </div>

      <div className="rounded-sm border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <FileText size={20} />
          <span className="text-2xl font-bold">
            {meeting.notes?.length || 0}
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-500">Notes</p>
      </div>

      <div className="rounded-sm border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <Archive size={20} />
          <span className="text-2xl font-bold">
            {meeting.materials?.length || 0}
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-500">Materials</p>
      </div>
    </div>
  );
};

const TabsHeader = ({ activeTab, setActiveTab }) => {
  return (
    <div className="rounded-sm border border-gray-200 bg-white px-5">
      <div className="flex flex-wrap gap-6">
        {tabs.map((tab) => {
          const icons = {
            Tasks: CheckSquare,
            Notes: FileText,
            Materials: Archive,
            Attendance: Calendar,
            Submission: Send,
          };

          const Icon = icons[tab];

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 py-4 text-sm font-medium ${
                activeTab === tab
                  ? "border-b-2 border-orange-500 text-orange-600"
                  : "text-gray-500"
              }`}
            >
              <Icon size={16} />
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
};
const TabsContent = ({
  activeTab,
  meeting,
  setOpenTaskPopup,
  setOpenNotePopup,
  setOpenMaterialPopup,
  handleDeleteTask,
  handleDeleteNote,
  handleDeleteMaterial,
}) => {
  return (
    <div className="rounded-sm border border-gray-200 bg-white p-5">
      {activeTab === "Tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Tasks</h2>

            <button
              type="button"
              onClick={() => setOpenTaskPopup(true)}
              className="rounded-sm bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600"
            >
              Create Task
            </button>
          </div>

          <TabTable
            data={meeting.tasks || []}
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
                key: "maxScore",
                label: "Max Score",
              },
              {
                key: "status",
                label: "Status",
              },
              {
                key: "dueDate",
                label: "Due Date",
                render: (row) => formatDate(row.dueDate),
              },
              {
                key: "actions",
                label: "Actions",
                render: (row) => (
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(row.id)}
                    className="flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium text-[var(--color-text-muted)] hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                ),
              },
            ]}
          />
        </div>
      )}

      {activeTab === "Notes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Notes</h2>

            <button
              type="button"
              onClick={() => setOpenNotePopup(true)}
              className="rounded-sm bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600"
            >
              Create Note
            </button>
          </div>

          <TabTable
            data={meeting.notes || []}
            columns={[
              {
                key: "id",
                label: "ID",
              },
              {
                key: "name",
                label: "Title",
              },
              {
                key: "description",
                label: "Description",
              },
              {
                key: "actions",
                label: "Actions",
                render: (row) => (
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(row.id)}
                    className="flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium text-[var(--color-text-muted)] hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                ),
              },
            ]}
          />
        </div>
      )}

      {activeTab === "Materials" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Materials</h2>

            <button
              type="button"
              onClick={() => setOpenMaterialPopup(true)}
              className="rounded-sm bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600"
            >
              Create Material
            </button>
          </div>

          <TabTable
            data={meeting.materials || []}
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
                key: "actions",
                label: "Actions",
                render: (row) => (
                  <button
                    type="button"
                    onClick={() => handleDeleteMaterial(row.id)}
                    className="flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium text-[var(--color-text-muted)] hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                ),
              },
            ]}
          />
        </div>
      )}

      {activeTab === "Attendance" && (
        <AttendanceTab
          meetingId={meeting.id}
          mentees={meeting.class?.mentees || []}
        />
      )}
      {activeTab === "Submission" && (
        <SubmissionsTab tasks={meeting.tasks || []} />
      )}
    </div>
  );
};
