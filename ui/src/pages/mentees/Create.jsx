import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Form from "@/components/ui/forms/Form";

import SuccessPopup from "@/components/ui/popup/SuccessPopUp";
import ErrorPopup from "@/components/ui/popup/ErrorPopUp";

import useForm from "@/hooks/useForm";

import { userSchema } from "@/schemas";

import MenteeService from "@/services/modules/mentee.service";

const Create = () => {
  const navigate = useNavigate();

  const { values, handleChange } = useForm(userSchema);

  const [error, setError] = useState("");

  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);

  const handleSubmit = async (payload) => {
    try {
      await MenteeService.create(payload);

      setOpenSuccess(true);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create mentee",
      );

      setOpenError(true);
    }
  };

  const handleCloseSuccess = () => {
    setOpenSuccess(false);

    navigate("/mentees");
  };

  return (
    <>
      <Form
        title="Create Mentee"
        description="Fill mentee personal information"
        schema={userSchema}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Create Mentee"
      />

      <SuccessPopup
        open={openSuccess}
        onClose={handleCloseSuccess}
        title="Mentee Created"
        message="Mentee has been created successfully."
      />

      <ErrorPopup
        open={openError}
        onClose={() => setOpenError(false)}
        title="Create Mentee Failed"
        message={error}
      />
    </>
  );
};

export default Create;
