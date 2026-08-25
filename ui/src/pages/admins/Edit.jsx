import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Form from "@/components/ui/forms/Form";

import SuccessPopup from "@/components/ui/popup/SuccessPopUp";
import ErrorPopup from "@/components/ui/popup/ErrorPopUp";

import useForm from "@/hooks/useForm";

import UserService from "@/services/modules/user.service";

import { userSchema } from "@/schemas";

const flattenAdmin = (admin) => ({
  name: admin?.name || "",
  email: admin?.email || "",
  avatarUrl: admin?.avatarUrl || "",
  age: admin?.profile?.age || "",
  phoneNumber: admin?.profile?.phoneNumber || "",
  city: admin?.profile?.city || "",
  background: admin?.profile?.background || "",
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
    const fetchAdmin = async () => {
      try {
        const res = await UserService.getById(id);

        setValues(flattenAdmin(res.data));
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load admin",
        );

        setOpenError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [id, setValues]);

  const handleSubmit = async (payload) => {
    try {
      await UserService.update(id, {
        ...payload,
        role: "Admin",
      });

      setOpenSuccess(true);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update admin",
      );

      setOpenError(true);
    }
  };

  const handleCloseSuccess = () => {
    setOpenSuccess(false);

    navigate("/admins");
  };

  if (loading) {
    return (
      <div className="rounded-sm border border-gray-200 bg-white p-4">
        Loading admin...
      </div>
    );
  }

  return (
    <>
      <Form
        title="Edit Admin"
        description="Update admin information"
        schema={userSchema}
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel="Update Admin"
      />

      <SuccessPopup
        open={openSuccess}
        onClose={handleCloseSuccess}
        title="Admin Updated"
        message="Admin has been updated successfully."
      />

      <ErrorPopup
        open={openError}
        onClose={() => setOpenError(false)}
        title="Update Admin Failed"
        message={error}
      />
    </>
  );
};

export default Edit;
