import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Form from "@/components/ui/forms/Form";
import LoadingPage from "@/components/ui/loading/LoadingPage";

import SuccessPopup from "@/components/ui/popup/SuccessPopUp";
import ErrorPopup from "@/components/ui/popup/ErrorPopUp";

import useForm from "@/hooks/useForm";

import { meetingSchema } from "@/schemas";

import ClassService from "@/services/modules/class.service";
import MeetingService from "@/services/modules/meeting.service";

const flattenData = (meeting) => ({
  ClassId: meeting?.ClassId || meeting?.class?.id || "",
  meetingNumber: meeting?.meetingNumber || "",
  name: meeting?.name || "",
  description: meeting?.description || "",
  meetingDate: meeting?.meetingDate?.slice(0, 10) || "",
  startHour: meeting?.startHour?.slice(0, 5) || "",
  finishHour: meeting?.finishHour?.slice(0, 5) || "",
  imageUrl: meeting?.imageUrl || "",
});

const Edit = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [schema, setSchema] = useState(meetingSchema);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);

  const { values, handleChange, setValues } = useForm(meetingSchema);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meetingRes, classRes] = await Promise.all([
          MeetingService.getById(id),
          ClassService.getAll(),
        ]);

        const classOptions = (classRes.data || []).map((cls) => ({
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

        setValues(flattenData(meetingRes.data));
      } catch (error) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load meeting",
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

      await MeetingService.update(id, {
        ...formData,
        ClassId: Number(formData.ClassId),
      });

      setOpenSuccess(true);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update meeting",
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
    return <LoadingPage title="Loading Meeting..." />;
  }

  return (
    <>
      <Form
        title="Edit Meeting"
        description="Update meeting information."
        schema={schema}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Update Meeting"
      />

      <SuccessPopup
        open={openSuccess}
        onClose={handleSuccessClose}
        title="Meeting Updated"
        message="Meeting has been updated successfully."
      />

      <ErrorPopup
        open={openError}
        onClose={() => setOpenError(false)}
        title="Update Meeting Failed"
        message={error}
      />
    </>
  );
};

export default Edit;
