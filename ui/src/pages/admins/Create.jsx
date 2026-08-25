import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Form from "@/components/ui/forms/Form";

import SuccessPopup from "@/components/ui/popup/SuccessPopUp";
import ErrorPopup from "@/components/ui/popup/ErrorPopUp";

import useForm from "@/hooks/useForm";

import UserService from "@/services/modules/user.service";

import { userSchema } from "@/schemas";

const Create = () => {
  const navigate = useNavigate();

  const { values, handleChange } = useForm(userSchema);

  const [error, setError] = useState("");

  const [openError, setOpenError] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);

  const handleSubmit = async (payload) => {
    try {
      await UserService.create({
        ...payload,
        role: "Admin",
      });

      setOpenSuccess(true);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create admin",
      );

      setOpenError(true);
    }
  };

  const handleCloseSuccess = () => {
    setOpenSuccess(false);

    navigate("/admins");
  };

  return (
    <>
      <Form
        title="Create Admin"
        description="Fill admin personal information"
        schema={userSchema}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Create Admin"
      />

      <SuccessPopup
        open={openSuccess}
        onClose={handleCloseSuccess}
        title="Admin Created"
        message="Admin has been created successfully."
      />

      <ErrorPopup
        open={openError}
        onClose={() => setOpenError(false)}
        title="Create Admin Failed"
        message={error}
      />
    </>
  );
};

export default Create;
