import React from "react";

import { buttonSizes, buttonVariants } from "./buttonVariants";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-sm font-medium transition-all
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${buttonVariants[variant] || buttonVariants.primary}
        ${buttonSizes[size] || buttonSizes.md}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
