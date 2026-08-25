import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Form from "@/components/ui/forms/Form";

import SuccessPopup from "@/components/ui/popup/SuccessPopUp";
import ErrorPopup from "@/components/ui/popup/ErrorPopUp";

import LoadingPage from "@/components/ui/loading/LoadingPage";

import useForm from "@/hooks/useForm";

import MentorService from "@/services/modules/mentor.service";

import { userSchema } from "@/schemas";

const flattenMentor = (mentor) => ({
  name: mentor?.name || "",
  email: mentor?.email || "",
  avatarUrl: mentor?.avatarUrl || "",
  age: mentor?.profile?.age || "",
  phoneNumber: mentor?.profile?.phoneNumber || "",
  city: mentor?.profile?.city || "",
  background: mentor?.profile?.background || "",
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
    const fetchMentor = async () => {
      try {
        const res = await MentorService.getById(id);

        setValues(flattenMentor(res.data));
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load mentor",
        );

        setOpenError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMentor();
  }, [id, setValues]);

  const handleSubmit = async (payload) => {
    try {
      setError("");

      await MentorService.update(id, payload);

      setOpenSuccess(true);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update mentor",
      );

      setOpenError(true);
    }
  };

  const handleCloseSuccess = () => {
    setOpenSuccess(false);

    navigate("/mentors");
  };

  if (loading) {
    return <LoadingPage title="Loading Mentor..." />;
  }

  return (
    <>
      <Form
        title="Edit Mentor"
        description="Update mentor information"
        schema={userSchema}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Update Mentor"
      />

      <SuccessPopup
        open={openSuccess}
        onClose={handleCloseSuccess}
        title="Mentor Updated"
        message="Mentor has been updated successfully."
      />

      <ErrorPopup
        open={openError}
        onClose={() => setOpenError(false)}
        title="Update Mentor Failed"
        message={error}
      />
    </>
  );
};

export default Edit;
