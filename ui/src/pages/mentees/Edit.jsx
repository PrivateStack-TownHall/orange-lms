import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Form from "@/components/ui/forms/Form";

import SuccessPopup from "@/components/ui/popup/SuccessPopUp";
import ErrorPopup from "@/components/ui/popup/ErrorPopUp";

import LoadingPage from "@/components/ui/loading/LoadingPage";

import useForm from "@/hooks/useForm";

import MenteeService from "@/services/modules/mentee.service";

import { userSchema } from "@/schemas";

const flattenMentee = (mentee) => ({
  name: mentee?.name || "",
  email: mentee?.email || "",
  avatarUrl: mentee?.avatarUrl || "",
  age: mentee?.profile?.age || "",
  phoneNumber: mentee?.profile?.phoneNumber || "",
  city: mentee?.profile?.city || "",
  background: mentee?.profile?.background || "",
});

const Edit = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);

  const { values, handleChange, setValues } = useForm(userSchema);

  useEffect(() => {
    const fetchMentee = async () => {
      try {
        const res = await MenteeService.getById(id);

        setValues(flattenMentee(res.data));
      } catch (error) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load mentee",
        );

        setOpenError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMentee();
  }, [id, setValues]);

  const handleSubmit = async (payload) => {
    try {
      await MenteeService.update(id, payload);

      setOpenSuccess(true);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update mentee",
      );

      setOpenError(true);
    }
  };

  const handleCloseSuccess = () => {
    setOpenSuccess(false);

    navigate("/mentees");
  };

  if (loading) {
    return <LoadingPage title="Loading Mentee..." />;
  }

  return (
    <>
      <Form
        title="Edit Mentee"
        description="Update mentee information"
        schema={userSchema}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Update Mentee"
      />

      <SuccessPopup
        open={openSuccess}
        onClose={handleCloseSuccess}
        title="Mentee Updated"
        message="Mentee has been updated successfully."
      />

      <ErrorPopup
        open={openError}
        onClose={() => setOpenError(false)}
        title="Update Mentee Failed"
        message={error}
      />
    </>
  );
};

export default Edit;
