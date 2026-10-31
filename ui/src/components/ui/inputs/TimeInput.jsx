import { Clock } from "lucide-react";

import FieldShell from "./FieldShell";

const TimeInput = ({
  label,
  value,
  onChange,
  placeholder,
  icon: IconProp,
  color = "amber",
  helper,
  info,
  error,
  disabled = false,
}) => {
  const Icon = IconProp || Clock;

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
      <input
        type="time"
        value={value || ""}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent py-2.5 pl-3 pr-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-gray-500"
      />
    </FieldShell>
  );
};

export default TimeInput;
