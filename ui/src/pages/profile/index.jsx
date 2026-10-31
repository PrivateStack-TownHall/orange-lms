import { Edit2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

import Form from "@/components/ui/forms/Form";
import { profileSchema } from "../../schemas";

import { useSelector } from "react-redux";

const roleStyles = {
  Owner: "bg-purple-100 text-purple-700",
  Admin: "bg-orange-100 text-orange-700",
  Mentor: "bg-blue-100 text-blue-700",
  Mentee: "bg-green-100 text-green-700",
};

const Profile = () => {
  const user = useSelector((state) => state.auth.user);

  const [values] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "",
    active: user?.isActive ? "active" : "not active",
    age: user?.profile?.age || "",
    phoneNumber: user?.profile?.phoneNumber || "",
    city: user?.profile?.city || "",
    country: user?.profile?.country || "",
    address: user?.profile?.address || "",
    background: user?.profile?.background || "",
  });

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img
              src={user.avatarUrl || "https://ui-avatars.com/api/?name=User"}
              alt={user.name}
              className="h-20 w-20 rounded-full border border-gray-200 object-cover"
            />

            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <span
                  className={`rounded-sm px-2 py-1 text-xs font-medium ${
                    roleStyles[user.role] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {user.role}
                </span>

                <span
                  className={`rounded-sm px-2 py-1 text-xs font-medium ${
                    user.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <h1 className="text-2xl font-bold">{user.name}</h1>

              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <Link
            to="/profile/edit"
            className="flex items-center gap-2 rounded-sm bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
          >
            <Edit2 size={16} />
            Edit
          </Link>
        </div>
      </div>
      <div className="space-y-4">
        <Form
          title="Profile Information"
          description="Your account and personal information."
          schema={profileSchema}
          values={values}
          onChange={() => {}}
          onSubmit={() => {}}
          submitLabel=""
        />
      </div>
      <h1>Profile Details</h1>
    </div>
  );
};

export default Profile;
