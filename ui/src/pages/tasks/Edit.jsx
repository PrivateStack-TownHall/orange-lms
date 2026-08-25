import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Form from "@/components/ui/forms/Form";

import LoadingPage from "@/components/ui/loading/LoadingPage";

import SuccessPopup from "@/components/ui/popup/SuccessPopUp";
import ErrorPopup from "@/components/ui/popup/ErrorPopUp";

import useForm from "@/hooks/useForm";
import useClassMeetingOptions from "@/hooks/useClassMeetingOptions";

import { taskSchema } from "@/schemas";

import TaskService from "@/services/modules/task.service";

const flattenTask = (task) => ({
  ClassId: task?.ClassId || task?.Class?.id || "",
  MeetingId: task?.MeetingId || task?.Meeting?.id || "",
  name: task?.name || "",
  description: task?.description || "",
  dueDate: task?.dueDate?.slice(0, 10) || "",
  maxScore: task?.maxScore || "",
  status: task?.status || "",
  fileUrl: task?.fileUrl || "",
});

const Edit = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);

  const { values, handleChange, setValues } = useForm(taskSchema);

  const schema = useClassMeetingOptions(values, setValues, taskSchema, true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await TaskService.getById(id);

        setValues(flattenTask(res.data));
      } catch (error) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load task",
        );

        setOpenError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, setValues]);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      await TaskService.update(id, {
        ...formData,
        ClassId: Number(formData.ClassId),
        MeetingId: Number(formData.MeetingId),
        maxScore: Number(formData.maxScore),
      });

      setOpenSuccess(true);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update task",
      );

      setOpenError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setOpenSuccess(false);

    navigate("/tasks");
  };

  if (loading) {
    return <LoadingPage title="Loading Task..." />;
  }

  return (
    <>
      <Form
        title="Edit Task"
        description="Update task information"
        schema={schema}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Update Task"
      />

      <SuccessPopup
        open={openSuccess}
        onClose={handleSuccessClose}
        title="Task Updated"
        message="Task has been updated successfully."
      />

      <ErrorPopup
        open={openError}
        onClose={() => setOpenError(false)}
        title="Update Task Failed"
        message={error}
      />
    </>
  );
};

export default Edit;
