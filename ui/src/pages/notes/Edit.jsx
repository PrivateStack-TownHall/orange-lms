import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Form from "@/components/ui/forms/Form";

import LoadingPage from "@/components/ui/loading/LoadingPage";

import SuccessPopup from "@/components/ui/popup/SuccessPopUp";
import ErrorPopup from "@/components/ui/popup/ErrorPopUp";

import useForm from "@/hooks/useForm";
import useClassMeetingOptions from "@/hooks/useClassMeetingOptions";

import { noteSchema } from "@/schemas";

import NoteService from "@/services/modules/note.service";

const Edit = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [openSuccess, setOpenSuccess] = useState(false);

  const [openError, setOpenError] = useState(false);

  const { values, handleChange, setValues } = useForm(noteSchema);

  const schema = useClassMeetingOptions(values, setValues, noteSchema, true);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);

        const res = await NoteService.getById(id);

        setValues(flattenNote(res.data));
      } catch (error) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load note",
        );

        setOpenError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, setValues]);

  const handleSubmit = async (payload) => {
    try {
      setLoading(true);

      await NoteService.update(id, {
        ...payload,
        ClassId: Number(payload.ClassId),
        MeetingId: Number(payload.MeetingId),
      });

      setOpenSuccess(true);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update note",
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
    return <LoadingPage title="Loading Note..." />;
  }

  return (
    <>
      <Form
        title="Edit Note"
        description="Update note information"
        schema={schema}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Update Note"
      />

      <SuccessPopup
        open={openSuccess}
        onClose={handleSuccessClose}
        title="Note Updated"
        message="Note has been updated successfully."
      />

      <ErrorPopup
        open={openError}
        onClose={() => setOpenError(false)}
        title="Update Note Failed"
        message={error}
      />
    </>
  );
};

const flattenNote = (note) => ({
  ClassId: note?.ClassId || note?.Class?.id || "",

  MeetingId: note?.MeetingId || note?.Meeting?.id || "",

  name: note?.name || "",

  description: note?.description || "",

  fileUrl: note?.fileUrl || "",
});

export default Edit;
