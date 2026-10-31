import React from "react";

import { INPUT_COMPONENTS, INPUT_COLORS } from "./form.type";

const FormField = ({ field, value, onChange }) => {
  const Component = INPUT_COMPONENTS[field.type];

  if (!Component) return null;

  const span =
    field.span === "full" ? "md:col-span-2" : field.span === "third" ? "" : "";

  return (
    <div className={span}>
      <Component
        {...field}
        color={field.color || INPUT_COLORS[field.type]}
        value={value}
        onChange={(value) => onChange(field.name, value)}
      />

      {field.hint && !field.helper && (
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          {field.hint}
        </p>
      )}
    </div>
  );
};

export default FormField;
