import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Form from "@/components/ui/forms/Form";
import LoadingPage from "@/components/ui/loading/LoadingPage";

import SuccessPopup from "@/components/ui/popup/SuccessPopUp";
import ErrorPopup from "@/components/ui/popup/ErrorPopUp";

import useForm from "@/hooks/useForm";

import { meetingSchema } from "@/schemas";

import ClassService from "@/services/modules/class.service";
import MeetingService from "@/services/modules/meeting.service";

const Create = () => {
  const navigate = useNavigate();

  const [schema, setSchema] = useState(meetingSchema);

  const { values, handleChange } = useForm(meetingSchema);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [openError, setOpenError] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await ClassService.getAll();

        const classOptions = (res.data || []).map((cls) => ({
          label: `${cls.code} - ${cls.name}`,
          value: cls.id,
        }));

        setSchema((prev) =>
          prev.map((field) =>
            field.name === "ClassId"
              ? {
                  ...field,
                  options: classOptions,
                }
              : field,
          ),
        );
      } catch (error) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load classes",
        );

        setOpenError(true);
      }
    };

    fetchClasses();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      const classId = Number(formData.ClassId);

      const payload = { ...formData };

      delete payload.ClassId;

      await MeetingService.create(classId, payload);

      setOpenSuccess(true);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create meeting",
      );

      setOpenError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setOpenSuccess(false);

    navigate("/meetings");
  };

  if (loading) {
    return <LoadingPage title="Creating Meeting..." />;
  }

  return (
    <>
      <Form
        title="Create Meeting"
        description="Create a new meeting."
        schema={schema}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Create Meeting"
      />

      <SuccessPopup
        open={openSuccess}
        onClose={handleSuccessClose}
        title="Meeting Created"
        message="Meeting has been created successfully."
      />

      <ErrorPopup
        open={openError}
        onClose={() => setOpenError(false)}
        title="Create Meeting Failed"
        message={error}
      />
    </>
  );
};

export default Create;
