import { Calendar } from "lucide-react";

import FieldShell from "./FieldShell";

const DateInput = ({
  label,
  value,
  onChange,
  placeholder,
  icon: IconProp,
  color = "green",
  helper,
  info,
  error,
  disabled = false,
}) => {
  const Icon = IconProp || Calendar;

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
        type="date"
        value={value ? value.slice(0, 10) : ""}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent py-2.5 pl-3 pr-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-gray-500"
      />
    </FieldShell>
  );
};

export default DateInput;
