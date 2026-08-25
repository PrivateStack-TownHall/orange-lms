import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Form from "@/components/ui/forms/Form";

import SuccessPopup from "@/components/ui/popup/SuccessPopUp";
import ErrorPopup from "@/components/ui/popup/ErrorPopUp";

import LoadingPage from "@/components/ui/loading/LoadingPage";

import useForm from "@/hooks/useForm";
import useClassMeetingOptions from "@/hooks/useClassMeetingOptions";

import { taskSchema } from "@/schemas";

import TaskService from "@/services/modules/task.service";

const Create = () => {
  const navigate = useNavigate();

  const { values, handleChange, setValues } = useForm(taskSchema);

  const schema = useClassMeetingOptions(values, setValues, taskSchema);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [openError, setOpenError] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      const { MeetingId, ClassId, ...taskData } = formData;

      await TaskService.createTaskByMeeting(MeetingId, taskData);

      setOpenSuccess(true);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create task",
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
    return <LoadingPage title="Creating Task..." />;
  }

  return (
    <>
      <Form
        title="Create Task"
        description="Fill task information"
        schema={schema}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Create Task"
      />

      <SuccessPopup
        open={openSuccess}
        onClose={handleSuccessClose}
        title="Task Created"
        message="Task has been created successfully."
      />

      <ErrorPopup
        open={openError}
        onClose={() => setOpenError(false)}
        title="Create Task Failed"
        message={error}
      />
    </>
  );
};

export default Create;
