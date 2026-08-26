import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Form from "@/components/ui/forms/Form";
import Popup from "@/components/ui/popup/PopUp";

import UserService from "@/services/modules/user.service";
import ProfileService from "@/services/modules/profile.service";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [openError, setOpenError] = useState(false);

  const isOwner = user?.role === "Owner";
  const isAdmin = user?.role === "Admin";

  const [values, setValues] = useState({
    name: user?.name || "",
    email: user?.email || "",

    role: user?.role || "",
    isActive: user?.isActive ?? true,

    avatarUrl: user?.avatarUrl || "",
    password: "",

    age: user?.profile?.age || "",
    gender: user?.profile?.gender || "",

    phoneNumber: user?.profile?.phoneNumber || "",
    city: user?.profile?.city || "",
    country: user?.profile?.country || "",

    address: user?.profile?.address || "",
    background: user?.profile?.background || "",
  });

  const handleChange = (name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");

      const userPayload = {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        avatarUrl: data.avatarUrl,
      };

      if (data.password?.trim()) {
        userPayload.password = data.password;
      }

      Object.keys(userPayload).forEach((key) => {
        if (
          userPayload[key] === undefined ||
          userPayload[key] === null ||
          userPayload[key] === ""
        ) {
          delete userPayload[key];
        }
      });

      const profilePayload = {
        age: data.age,
        gender: data.gender,
        phoneNumber: data.phoneNumber,
        city: data.city,
        country: data.country,
        address: data.address,
        background: data.background,
      };

      Object.keys(profilePayload).forEach((key) => {
        if (profilePayload[key] === undefined) {
          delete profilePayload[key];
        }
      });

      await UserService.update(user.id, userPayload);

      await ProfileService.update(user.id, profilePayload);

      navigate("/profile");
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update profile",
      );

      setOpenError(true);
    } finally {
      setLoading(false);
    }
  };

  const schema = [
    ...(isOwner || isAdmin
      ? [
          {
            name: "name",
            label: "Full Name",
            type: "text",
          },
          {
            name: "email",
            label: "Email",
            type: "email",
          },
        ]
      : []),

    {
      name: "password",
      label: "New Password",
      type: "text",
      placeholder: "Leave empty if not changing password",
    },

    // {
    //   name: "avatarUrl",
    //   label: "Avatar",
    //   type: "file",
    // },

    {
      name: "age",
      label: "Age",
      type: "number",
    },

    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: [
        {
          label: "Male",
          value: "Male",
        },
        {
          label: "Female",
          value: "Female",
        },
      ],
    },

    {
      name: "phoneNumber",
      label: "Phone Number",
      type: "text",
    },

    {
      name: "city",
      label: "City",
      type: "text",
    },

    {
      name: "country",
      label: "Country",
      type: "text",
    },

    {
      name: "address",
      label: "Address",
      type: "textarea",
    },

    {
      name: "background",
      label: "Professional Background",
      type: "textarea",
    },

    ...(isOwner
      ? [
          {
            name: "role",
            label: "Role",
            type: "select",
            options: [
              {
                label: "Owner",
                value: "Owner",
              },
              {
                label: "Admin",
                value: "Admin",
              },
              {
                label: "Mentor",
                value: "Mentor",
              },
              {
                label: "Mentee",
                value: "Mentee",
              },
            ],
          },

          {
            name: "isActive",
            label: "Status",
            type: "select",
            options: [
              {
                label: "Active",
                value: true,
              },
              {
                label: "Inactive",
                value: false,
              },
            ],
          },
        ]
      : []),
  ];

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Saving profile...</div>;
  }

  return (
    <>
      <div className="space-y-4 p-4">
        <Form
          title="Edit Profile"
          description="Update your personal information."
          schema={schema}
          values={values}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="0"
        />
      </div>

      <Popup
        open={openError}
        onClose={() => setOpenError(false)}
        title="Update Profile Failed"
        width="max-w-md"
      >
        <div className="space-y-4">
          <div className="rounded-sm border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setOpenError(false)}
              className="rounded-sm bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
            >
              Close
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
};

export default EditProfile;
