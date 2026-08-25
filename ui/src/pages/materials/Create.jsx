import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Form from "@/components/ui/forms/Form";

import SuccessPopup from "@/components/ui/popup/SuccessPopUp";
import ErrorPopup from "@/components/ui/popup/ErrorPopUp";

import useForm from "@/hooks/useForm";
import useClassMeetingOptions from "@/hooks/useClassMeetingOptions";

import { materialSchema } from "@/schemas";

import MaterialService from "@/services/modules/material.service";

const Create = () => {
  const navigate = useNavigate();

  const { values, handleChange, setValues } = useForm(materialSchema);

  const schema = useClassMeetingOptions(values, setValues, materialSchema);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [openSuccess, setOpenSuccess] = useState(false);

  const [openError, setOpenError] = useState(false);

  const handleSubmit = async (payload) => {
    try {
      setLoading(true);
      setError("");

      const { MeetingId, ClassId, ...materialData } = payload;

      await MaterialService.createMaterialByMeeting(
        Number(MeetingId),
        materialData,
      );

      setOpenSuccess(true);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create material",
      );

      setOpenError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setOpenSuccess(false);

    navigate("/materials");
  };

  if (loading) {
    return (
      <div className="rounded-sm border border-gray-200 bg-white p-4">
        Creating material...
      </div>
    );
  }

  return (
    <>
      <Form
        title="Create Material"
        description="Fill material information"
        schema={schema}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Create Material"
      />

      <SuccessPopup
        open={openSuccess}
        onClose={handleCloseSuccess}
        title="Material Created"
        message="Material has been created successfully."
      />

      <ErrorPopup
        open={openError}
        onClose={() => setOpenError(false)}
        title="Create Material Failed"
        message={error}
      />
    </>
  );
};

export default Create;
