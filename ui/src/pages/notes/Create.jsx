import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Form from "@/components/ui/forms/Form";

import LoadingPage from "@/components/ui/loading/LoadingPage";

import SuccessPopup from "@/components/ui/popup/SuccessPopUp";
import ErrorPopup from "@/components/ui/popup/ErrorPopUp";

import useForm from "@/hooks/useForm";
import useClassMeetingOptions from "@/hooks/useClassMeetingOptions";

import { noteSchema } from "@/schemas";

import NoteService from "@/services/modules/note.service";

const Create = () => {
  const navigate = useNavigate();

  const { values, handleChange, setValues } = useForm(noteSchema);

  const schema = useClassMeetingOptions(values, setValues, noteSchema);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [openSuccess, setOpenSuccess] = useState(false);

  const [openError, setOpenError] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      const { MeetingId, ClassId, ...noteData } = formData;

      await NoteService.createNoteByMeeting(MeetingId, noteData);

      setOpenSuccess(true);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create note",
      );

      setOpenError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setOpenSuccess(false);

    navigate("/notes");
  };

  if (loading) {
    return <LoadingPage title="Creating Note..." />;
  }

  return (
    <>
      <Form
        title="Create Note"
        description="Fill note information"
        schema={schema}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Create Note"
      />

      <SuccessPopup
        open={openSuccess}
        onClose={handleSuccessClose}
        title="Note Created"
        message="Note has been created successfully."
      />

      <ErrorPopup
        open={openError}
        onClose={() => setOpenError(false)}
        title="Create Note Failed"
        message={error}
      />
    </>
  );
};

export default Create;
