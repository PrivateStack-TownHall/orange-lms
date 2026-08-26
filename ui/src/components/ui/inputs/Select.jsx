import { ChevronDown, ListFilter } from "lucide-react";

import FieldShell from "./FieldShell";

const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select",
  icon: IconProp,
  color = "purple",
  helper,
  info,
  error,
  disabled = false,
}) => {
  const Icon = IconProp || ListFilter;

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
      <div className="relative flex-1">
        <select
          value={value || ""}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-transparent py-2.5 pl-3 pr-9 text-sm outline-none disabled:cursor-not-allowed disabled:text-gray-500"
        >
          <option value="">{placeholder}</option>

          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>
    </FieldShell>
  );
};

export default Select;
