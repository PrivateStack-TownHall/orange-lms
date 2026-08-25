import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Form from "@/components/ui/forms/Form";
import LoadingPage from "@/components/ui/loading/LoadingPage";

import SuccessPopup from "@/components/ui/popup/SuccessPopUp";
import ErrorPopup from "@/components/ui/popup/ErrorPopUp";

import useForm from "@/hooks/useForm";

import { classSchema } from "@/schemas";

import ClassService from "@/services/modules/class.service";
import MentorService from "@/services/modules/mentor.service";

const flattenData = (cls) => ({
  code: cls?.code || "",
  name: cls?.name || "",
  description: cls?.description || "",
  category: cls?.category || "",
  level: cls?.level || "",
  startDate: cls?.startDate?.slice(0, 10) || "",
  endDate: cls?.endDate?.slice(0, 10) || "",
  status: cls?.status || "",
  imageUrl: cls?.imageUrl || "",
  MentorId: cls?.MentorId || cls?.mentor?.id || "",
});

const Edit = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [schema, setSchema] = useState(classSchema);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);

  const { values, handleChange, setValues } = useForm(classSchema);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, mentorRes] = await Promise.all([
          ClassService.getById(id),
          MentorService.getAll(),
        ]);

        const mentorOptions = (mentorRes.data || []).map((mentor) => ({
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

        setValues(flattenData(classRes.data));
      } catch (error) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load class",
        );

        setOpenError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, setValues]);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      await ClassService.update(id, {
        ...formData,
        MentorId: Number(formData.MentorId),
      });

      setOpenSuccess(true);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update class",
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
    return <LoadingPage title="Loading Class..." />;
  }

  return (
    <>
      <Form
        title="Edit Class"
        description="Update class information."
        schema={schema}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Update Class"
      />

      <SuccessPopup
        open={openSuccess}
        onClose={handleSuccessClose}
        title="Class Updated"
        message="Class has been updated successfully."
      />

      <ErrorPopup
        open={openError}
        onClose={() => setOpenError(false)}
        title="Update Class Failed"
        message={error}
      />
    </>
  );
};

export default Edit;
