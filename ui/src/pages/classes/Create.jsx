import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Form from "@/components/ui/forms/Form";
import LoadingPage from "@/components/ui/loading/LoadingPage";

import SuccessPopup from "@/components/ui/popup/SuccessPopUp";
import ErrorPopup from "@/components/ui/popup/ErrorPopUp";

import useForm from "@/hooks/useForm";

import { classSchema } from "@/schemas";

import ClassService from "@/services/modules/class.service";
import MentorService from "@/services/modules/mentor.service";

const Create = () => {
  const navigate = useNavigate();

  const [schema, setSchema] = useState(classSchema);

  const { values, handleChange } = useForm(classSchema);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [openError, setOpenError] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await MentorService.getAll();

        const mentorOptions = (res.data || []).map((mentor) => ({
          label: mentor.name,
          value: mentor.id,
        }));

        setSchema((prev) =>
          prev.map((field) =>
            field.name === "MentorId"
              ? {
                  ...field,
                  options: mentorOptions,
                }
              : field,
          ),
        );
      } catch (error) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load mentors",
        );

        setOpenError(true);
      }
    };

    fetchMentors();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      await ClassService.create({
        ...formData,
        MentorId: Number(formData.MentorId),
      });

      setOpenSuccess(true);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create class",
      );

      setOpenError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setOpenSuccess(false);

    navigate("/classes");
  };

  if (loading) {
    return <LoadingPage title="Creating Class..." />;
  }

  return (
    <>
      <Form
        title="Create Class"
        description="Create a new learning class."
        schema={schema}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Create Class"
      />

      <SuccessPopup
        open={openSuccess}
        onClose={handleSuccessClose}
        title="Class Created"
        message="Class has been created successfully."
      />

      <ErrorPopup
        open={openError}
        onClose={() => setOpenError(false)}
        title="Create Class Failed"
        message={error}
      />
    </>
  );
};

export default Create;
