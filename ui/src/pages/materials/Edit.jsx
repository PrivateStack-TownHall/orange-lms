import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Form from "@/components/ui/forms/Form";

import SuccessPopup from "@/components/ui/popup/SuccessPopUp";
import ErrorPopup from "@/components/ui/popup/ErrorPopUp";

import useForm from "@/hooks/useForm";
import useClassMeetingOptions from "@/hooks/useClassMeetingOptions";

import { materialSchema } from "@/schemas";

import MaterialService from "@/services/modules/material.service";

const Edit = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [openSuccess, setOpenSuccess] = useState(false);

  const [openError, setOpenError] = useState(false);

  const { values, handleChange, setValues } = useForm(materialSchema);

  const schema = useClassMeetingOptions(
    values,
    setValues,
    materialSchema,
    true,
  );

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        setLoading(true);

        const res = await MaterialService.getById(id);

        setValues(flattenMaterial(res.data));
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load material",
        );

        setOpenError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [id, setValues]);

  const handleSubmit = async (payload) => {
    try {
      setLoading(true);
      setError("");

      await MaterialService.update(id, {
        ...payload,
        ClassId: Number(payload.ClassId),
        MeetingId: Number(payload.MeetingId),
      });

      setOpenSuccess(true);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update material",
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
        Loading material...
      </div>
    );
  }

  return (
    <>
      <Form
        title="Edit Material"
        description="Update material information"
        schema={schema}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Update Material"
      />

      <SuccessPopup
        open={openSuccess}
        onClose={handleCloseSuccess}
        title="Material Updated"
        message="Material has been updated successfully."
      />

      <ErrorPopup
        open={openError}
        onClose={() => setOpenError(false)}
        title="Update Material Failed"
        message={error}
      />
    </>
  );
};

const flattenMaterial = (material) => ({
  ClassId: material?.ClassId || material?.Class?.id || "",

  MeetingId: material?.MeetingId || material?.Meeting?.id || "",

  name: material?.name || "",

  description: material?.description || "",

  type: material?.type || "",

  fileUrl: material?.fileUrl || "",
});

export default Edit;
