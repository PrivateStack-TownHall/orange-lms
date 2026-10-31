import React from "react";

const InfoCard = ({ label, value, icon: Icon }) => {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="mt-0.5">
          <Icon size={16} className="text-[var(--color-text-muted)]" />
        </div>
      )}

      <div>
        <p className="text-sm text-[var(--color-text-muted)]">{label}</p>

        <p className="font-medium text-[var(--color-text)]">{value || "-"}</p>
      </div>
    </div>
  );
};

export default InfoCard;
