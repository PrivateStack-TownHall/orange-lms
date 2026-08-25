import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Form from "@/components/ui/forms/Form";

import SuccessPopup from "@/components/ui/popup/SuccessPopUp";
import ErrorPopup from "@/components/ui/popup/ErrorPopUp";

import useForm from "@/hooks/useForm";

import { userSchema } from "@/schemas";

import MentorService from "@/services/modules/mentor.service";

const Create = () => {
  const navigate = useNavigate();

  const { values, handleChange } = useForm(userSchema);

  const [error, setError] = useState("");

  const [openError, setOpenError] = useState(false);

  const [openSuccess, setOpenSuccess] = useState(false);

  const handleSubmit = async (payload) => {
    try {
      setError("");

      await MentorService.create(payload);

      setOpenSuccess(true);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create mentor",
      );

      setOpenError(true);
    }
  };

  const handleCloseSuccess = () => {
    setOpenSuccess(false);

    navigate("/mentors");
  };

  return (
    <>
      <Form
        title="Create Mentor"
        description="Fill mentor personal information"
        schema={userSchema}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Create Mentor"
      />

      <SuccessPopup
        open={openSuccess}
        onClose={handleCloseSuccess}
        title="Mentor Created"
        message="Mentor has been created successfully."
      />

      <ErrorPopup
        open={openError}
        onClose={() => setOpenError(false)}
        title="Create Mentor Failed"
        message={error}
      />
    </>
  );
};

export default Create;
