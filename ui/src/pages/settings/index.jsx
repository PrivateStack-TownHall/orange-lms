import { Bell, Info, Lock, Palette, Save, User } from "lucide-react";

import { useSelector } from "react-redux";

import PageHeader from "@/components/ui/page/PageHeader";
import Accordion from "@/components/ui/accordion/Accordion";

import useBreadcrumbs from "@/hooks/useBreadcrumbs";

const Settings = () => {
  const breadcrumbs = useBreadcrumbs();

  const user = useSelector((state) => state.auth.user);

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="Settings"
        description="Manage your account and application preferences"
      />

      {/* Profile */}
      <Accordion title="Profile Settings" defaultOpen>
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <User size={18} />

            <h3 className="font-semibold">Profile Information</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={user?.name || ""}
              readOnly
              className="rounded-sm border border-gray-200 p-3"
            />

            <input
              value={user?.email || ""}
              readOnly
              className="rounded-sm border border-gray-200 p-3"
            />

            <input
              value={user?.profile?.phoneNumber || ""}
              readOnly
              className="rounded-sm border border-gray-200 p-3"
            />

            <input
              value={user?.profile?.city || ""}
              readOnly
              className="rounded-sm border border-gray-200 p-3"
            />

            <textarea
              rows={4}
              value={user?.profile?.background || ""}
              readOnly
              className="rounded-sm border border-gray-200 p-3 md:col-span-2"
            />
          </div>
        </div>
      </Accordion>

      {/* Security */}
      <Accordion title="Security Settings">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <Lock size={18} />

            <h3 className="font-semibold">Change Password</h3>
          </div>

          <input
            type="password"
            placeholder="Current Password"
            className="w-full rounded-sm border border-gray-200 p-3"
          />

          <input
            type="password"
            placeholder="New Password"
            className="w-full rounded-sm border border-gray-200 p-3"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full rounded-sm border border-gray-200 p-3"
          />

          <button className="inline-flex items-center gap-2 rounded-sm bg-orange-500 px-4 py-2 text-white hover:bg-orange-600">
            <Save size={16} />
            Change Password
          </button>
        </div>
      </Accordion>

      {/* Appearance */}
      <Accordion title="Appearance">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <Palette size={18} />

            <h3 className="font-semibold">Theme Preferences</h3>
          </div>

          <select className="w-full rounded-sm border border-gray-200 p-3">
            <option>Light</option>

            <option>Dark</option>

            <option>System</option>
          </select>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Compact Sidebar
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Show Icons
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Show Labels
            </label>
          </div>

          <button className="inline-flex items-center gap-2 rounded-sm bg-orange-500 px-4 py-2 text-white hover:bg-orange-600">
            <Save size={16} />
            Save Appearance
          </button>
        </div>
      </Accordion>

      {/* Notifications */}
      <Accordion title="Notification Settings">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <Bell size={18} />

            <h3 className="font-semibold">Notifications</h3>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            Email Notifications
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            Task Notifications
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            Meeting Notifications
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            Class Notifications
          </label>

          <button className="inline-flex items-center gap-2 rounded-sm bg-orange-500 px-4 py-2 text-white hover:bg-orange-600">
            <Save size={16} />
            Save Notifications
          </button>
        </div>
      </Accordion>

      {/* System Info */}
      <Accordion title="System Information">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
            <Info size={18} />

            <h3 className="font-semibold">Application Information</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard label="Application" value="Orange LMS" />

            <InfoCard label="Version" value="1.0.0" />

            <InfoCard label="Frontend" value="React 19" />

            <InfoCard label="Backend" value="Node.js + Express" />

            <InfoCard label="Database" value="PostgreSQL" />

            <InfoCard label="Environment" value={import.meta.env.MODE} />
          </div>
        </div>
      </Accordion>
    </div>
  );
};

const InfoCard = ({ label, value }) => (
  <div className="rounded-sm border border-gray-200 p-4">
    <p className="text-xs text-gray-500">{label}</p>

    <p className="mt-1 font-semibold">{value}</p>
  </div>
);

export default Settings;
