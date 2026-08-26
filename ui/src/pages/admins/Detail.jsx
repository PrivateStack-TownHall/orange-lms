import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import usePopupStore from "@/app/store/popupStore";

import useBreadcrumbs from "@/hooks/useBreadcrumbs";

import UserService from "@/services/modules/user.service";

import LoadingPage from "@/components/ui/loading/LoadingPage";

import PageHeader from "@/components/ui/page/PageHeader";

import Tabs from "@/components/ui/tabs/Tabs";
import TabHeader from "@/components/ui/tabs/TabHeader";
import TabContent from "@/components/ui/tabs/TabContent";

import TableActions from "@/components/ui/tables/TableActions";

const TABS = [
  {
    label: "Active Classes",
    value: "active",
  },
  {
    label: "Finished Classes",
    value: "finished",
  },
];

const Detail = () => {
  const { id } = useParams();

  const breadcrumbs = useBreadcrumbs([
    {
      label: "Admins",
      to: "/admins",
    },
  ]);

  const { openConfirm, openError, openSuccess } = usePopupStore();

  const [admin, setAdmin] = useState(null);

  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await UserService.getById(id);

        setAdmin(res.data);
      } catch (error) {
        console.error(error);

        openError({
          title: "Load Failed",
          message: error?.response?.data?.message || "Failed to load admin.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [id, openError]);

  const handleRemove = () => {
    openConfirm({
      title: "Delete Admin",
      message:
        "Are you sure you want to delete this admin? This action cannot be undone.",

      action: async () => {
        try {
          await UserService.delete(id);

          openSuccess({
            title: "Success",
            message: "Admin deleted successfully.",
          });
        } catch (error) {
          console.error(error);

          openError({
            title: "Delete Failed",
            message:
              error?.response?.data?.message || "Failed to delete admin.",
          });
        }
      },
    });
  };

  const { activeClasses, finishedClasses } = useMemo(() => {
    const classes = admin?.managedClasses || [];

    return {
      activeClasses: classes.filter((item) => item.status === "Active"),
      finishedClasses: classes.filter((item) => item.status === "Finished"),
    };
  }, [admin]);

  if (loading) {
    return <LoadingPage title="Loading Admin..." />;
  }

  if (!admin) {
    return <div className="p-4">Admin not found.</div>;
  }

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <PageHeader
        breadcrumbs={breadcrumbs}
        title={admin.name}
        description={admin.email}
      />

      <Link
        to="/admins"
        className="inline-flex items-center gap-2 rounded-sm border border-gray-200 bg-[var(--color-surface)] px-3 py-2 text-sm hover:bg-gray-50"
      >
        <ArrowLeft size={16} />
        Back to Admins
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-5">
            <div className="flex flex-col items-center">
              <img
                src={
                  admin.avatarUrl || "https://placehold.co/150x150?text=Admin"
                }
                alt={admin.name}
                className="h-32 w-32 rounded-sm border border-gray-200 object-cover"
              />

              <h1 className="mt-4 text-center text-xl font-bold">
                {admin.name}
              </h1>

              <p className="mt-1 text-center text-sm text-[var(--color-text-muted)]">
                {admin.email}
              </p>

              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <span className="rounded-sm bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                  {admin.role}
                </span>

                <span
                  className={`rounded-sm px-2 py-1 text-xs font-medium ${
                    admin.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {admin.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-4">
                <TableActions
                  id={admin.id}
                  resource="admin"
                  detailUrl={null}
                  editUrl={`/admins/edit/${admin.id}`}
                  showDetail={false}
                  onDelete={handleRemove}
                />
              </div>

              <div className="mt-6 w-full space-y-4 border-t border-gray-200 pt-5">
                <InfoItem
                  label="Age"
                  value={`${admin.profile?.age || "-"} Years Old`}
                />

                <InfoItem label="Gender" value={admin.profile?.gender || "-"} />

                <InfoItem
                  label="Address"
                  value={`${admin.profile?.address || "-"}, ${admin.profile?.city || "-"}, ${admin.profile?.country || "-"}`}
                />

                <InfoItem
                  label="Phone Number"
                  value={admin.profile?.phoneNumber || "-"}
                />

                <InfoItem
                  label="Background"
                  value={admin.profile?.background || "-"}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <Tabs>
            <TabHeader
              tabs={TABS}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            <div className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
              <TabContent activeTab={activeTab} value="active">
                <ClassList data={activeClasses} />
              </TabContent>

              <TabContent activeTab={activeTab} value="finished">
                <ClassList data={finishedClasses} />
              </TabContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>

    <p className="mt-1 font-medium">{value}</p>
  </div>
);

const ClassList = ({ data }) => {
  if (!data?.length) {
    return <p className="text-sm text-gray-500">No classes found.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.id} className="rounded-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{item.code}</p>

              <p className="text-sm text-gray-500">{item.name}</p>
            </div>

            <span className="rounded-sm bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
              {item.level}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Detail;
