import { Upload, File } from "lucide-react";

import FieldShell from "./FieldShell";

const FileInput = ({
  label,
  value,
  onChange,
  accept,
  icon: IconProp,
  color = "orange",
  helper,
  info,
  error,
  disabled = false,
}) => {
  const Icon = IconProp || Upload;

  return (
    <FieldShell
      label={label}
      icon={Icon}
      color={color}
      helper={helper}
      info={info}
      error={error}
      disabled={disabled}
    >
      <label
        className={`flex w-full items-center gap-2 py-2.5 pl-3 pr-3 text-sm ${
          disabled ? "cursor-not-allowed text-gray-400" : "cursor-pointer text-[var(--color-text-muted)]"
        }`}
      >
        <span className="truncate">
          {value?.name || "Choose file"}
        </span>

        <input
          type="file"
          accept={accept}
          disabled={disabled}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
      </label>
    </FieldShell>
  );
};

export default FileInput;
