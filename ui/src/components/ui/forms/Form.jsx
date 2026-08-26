import { ClipboardEdit, Lightbulb, X } from "lucide-react";

import FormField from "./FormField";
import Button from "../buttons/Button";

// Theme tokens per Create page — keeps the banner, badge, and the
// large watermark icon on the right all in the same family of colors.
const FORM_THEMES = {
  orange: {
    border: "border-orange-100",
    gradient: "from-orange-50 via-orange-50/70 to-white",
    badge: "bg-orange-100 text-orange-600",
    watermark: "text-orange-200",
    tipIcon: "text-orange-400",
  },
  green: {
    border: "border-green-100",
    gradient: "from-green-50 via-green-50/70 to-white",
    badge: "bg-green-100 text-green-600",
    watermark: "text-green-200",
    tipIcon: "text-green-400",
  },
  blue: {
    border: "border-blue-100",
    gradient: "from-blue-50 via-blue-50/70 to-white",
    badge: "bg-blue-100 text-blue-600",
    watermark: "text-blue-200",
    tipIcon: "text-blue-400",
  },
  purple: {
    border: "border-purple-100",
    gradient: "from-purple-50 via-purple-50/70 to-white",
    badge: "bg-purple-100 text-purple-600",
    watermark: "text-purple-200",
    tipIcon: "text-purple-400",
  },
};

const Form = ({
  title,
  description,
  icon: Icon = ClipboardEdit,
  color = "orange",
  schema,
  values,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  tip = "You can always edit these details later.",
}) => {
  const theme = FORM_THEMES[color] || FORM_THEMES.orange;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      {/* Banner Header */}
      <div
        className={`relative overflow-hidden border-b ${theme.border} bg-gradient-to-r ${theme.gradient} px-6 py-6`}
      >
        {/* decorative watermark — mirrors this page's own icon & theme */}
        <Icon
          className={`pointer-events-none absolute right-6 top-1/2 hidden h-24 w-24 -translate-y-1/2 ${theme.watermark} sm:block`}
          strokeWidth={1.5}
        />

        <div className="relative flex items-center gap-4">
          <div className={`rounded-xl p-3 ${theme.badge}`}>
            <Icon size={26} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">
              {title}
            </h2>

            {description && (
              <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 p-6 md:grid-cols-2">
        {schema.map((field) => (
          <FormField
            key={field.name}
            field={field}
            value={values[field.name]}
            onChange={onChange}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        {tip && (
          <div className="flex items-start gap-2 text-xs text-[var(--color-text-muted)]">
            <Lightbulb size={16} className={`mt-0.5 shrink-0 ${theme.tipIcon}`} />
            <span>{tip}</span>
          </div>
        )}

        <div className="flex shrink-0 justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              <X size={16} />
              Cancel
            </Button>
          )}

          <Button type="submit">{submitLabel}</Button>
        </div>
      </div>
    </form>
  );
};

export default Form;
