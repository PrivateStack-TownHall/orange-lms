import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  Folder,
  BookOpen,
  Calendar,
  Users,
  FileText,
  Paperclip,
  HardDrive,
} from "lucide-react";

import { can, formatDate } from "@/helpers";

import MaterialService from "@/services/modules/material.service";

import ActionButton from "@/components/ui/buttons/ActionButton";
import LoadingPage from "@/components/ui/loading/LoadingPage";
import StatusBadge from "@/components/ui/status/StatusBadge";

const Detail = ({ material: materialProp, role: roleProp, onDelete }) => {
  const { id } = useParams();
  const user = useSelector((state) => state.auth.user);
  const role = roleProp || user?.role;

  const [material, setMaterial] = useState(materialProp || null);
  const [loading, setLoading] = useState(!materialProp && !!id);

  useEffect(() => {
    if (materialProp || !id) return;

    const fetchMaterial = async () => {
      try {
        const res = await MaterialService.getById(id);
        setMaterial(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <LoadingPage title="Loading Material..." />;
  }

  if (!material) return null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      {/* LEFT */}
      <div className="lg:col-span-1">
        <div className="rounded-sm border border-gray-200 bg-white p-5">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-sm bg-orange-100">
              <Folder size={40} className="text-orange-600" />
            </div>

            <h2 className="mt-4 text-lg font-bold">{material.name}</h2>

            <div className="mt-2 flex items-center gap-2 text-xs">
              <StatusBadge status={material.status || "Published"} />
              <span className="text-[var(--color-text-muted)]">
                MAT-{String(material.id).padStart(4, "0")}
              </span>
            </div>

            <div className="mt-5 w-full space-y-4 text-left text-sm">
              <SidebarField icon={Users} label="Uploaded By">
                {material.uploader?.name || "-"}
              </SidebarField>

              <SidebarField icon={FileText} label="Type">
                {material.type || "-"}
              </SidebarField>
            </div>

            <div className="mt-5 flex w-full gap-2">
              {can(role, "material", "update") && (
                <Link to={`/materials/edit/${material.id}`} className="flex-1">
                  <ActionButton
                    action="edit"
                    className="w-full justify-center py-2"
                  />
                </Link>
              )}

              {can(role, "material", "delete") && (
                <ActionButton
                  action="delete"
                  className="flex-1 justify-center py-2"
                  onClick={() => onDelete?.(material.id)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="space-y-4 lg:col-span-3">
        <InfoCard icon={FileText} title="Description">
          <p className="text-sm leading-6 text-gray-600">
            {material.description || "-"}
          </p>
        </InfoCard>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MetaCard icon={BookOpen} label="Class">
            <p className="font-semibold">{material.Class?.code || "-"}</p>
            <p className="text-sm text-gray-500">
              {material.Class?.name || "-"}
            </p>
          </MetaCard>

          <MetaCard icon={Users} label="Meeting">
            <p className="font-semibold">
              Meeting #{material.Meeting?.meetingNumber || "-"}
            </p>
            <p className="text-sm text-gray-500">
              {material.Meeting?.name || "-"}
            </p>
          </MetaCard>

          <MetaCard icon={Calendar} label="Meeting Date">
            <p>
              {material.Meeting?.meetingDate
                ? formatDate(material.Meeting.meetingDate)
                : "-"}
            </p>
          </MetaCard>

          <MetaCard icon={HardDrive} label="Material Uploaded">
            <p>{material.createdAt ? formatDate(material.createdAt) : "-"}</p>
          </MetaCard>
        </div>

        <InfoCard icon={Paperclip} title="Attachment">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Download or open material file
            </p>
            {material.fileUrl ? (
              <div className="flex gap-2">
                <a
                  href={material.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-sm border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                >
                  Preview
                </a>
                <ActionButton action="download" href={material.fileUrl}>
                  Download File
                </ActionButton>
              </div>
            ) : (
              <span className="text-sm text-gray-500">No attachment</span>
            )}
          </div>
        </InfoCard>
      </div>
    </div>
  );
};

const SidebarField = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-2">
    <Icon
      size={15}
      className="mt-0.5 shrink-0 text-[var(--color-text-muted)]"
    />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <div className="font-medium">{children}</div>
    </div>
  </div>
);

const InfoCard = ({ icon: Icon, title, children }) => (
  <div className="rounded-sm border border-gray-200 bg-white p-5">
    <div className="mb-3 flex items-center gap-2">
      <Icon size={18} className="text-orange-500" />
      <h3 className="font-semibold">{title}</h3>
    </div>
    {children}
  </div>
);

const MetaCard = ({ icon: Icon, label, children }) => (
  <div className="rounded-sm border border-gray-200 bg-white p-4">
    <div className="mb-2 flex items-center gap-2">
      <Icon size={18} className="text-orange-500" />
      <span className="font-medium">{label}</span>
    </div>
    {children}
  </div>
);

export default Detail;
