import { FileText } from "lucide-react";

import FieldShell from "./FieldShell";

const MAX_DEFAULT = 500;

const TextArea = ({
  label,
  value,
  onChange,
  placeholder,
  icon: IconProp,
  color,
  helper,
  info,
  error,
  maxLength,
  showCount = false,
  disabled = false,
}) => {
  const Icon = IconProp || FileText;

  return (
    <FieldShell
      label={label}
      icon={Icon}
      color={color}
      info={info}
      error={error}
      disabled={disabled}
      textareaAlign
      helper={
        showCount
          ? `${(value || "").length} / ${maxLength || MAX_DEFAULT}`
          : helper
      }
    >
      <textarea
        value={value || ""}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength || MAX_DEFAULT}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[110px] w-full resize-none bg-transparent py-2.5 pl-3 pr-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-gray-500"
      />
    </FieldShell>
  );
};

export default TextArea;
