import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

import FieldShell from "./FieldShell";

const PasswordInput = ({
  label,
  value,
  onChange,
  placeholder = "Enter password",
  icon: IconProp,
  color = "gray",
  helper,
  info,
  error,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const Icon = IconProp || Lock;

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
        type={showPassword ? "text" : "password"}
        value={value || ""}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent py-2.5 pl-3 pr-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-gray-500"
      />

      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        disabled={disabled}
        className="flex shrink-0 items-center justify-center px-3 text-[var(--color-text-muted)] disabled:cursor-not-allowed"
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </FieldShell>
  );
};

export default PasswordInput;
