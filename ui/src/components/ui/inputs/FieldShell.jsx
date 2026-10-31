import { Info } from "lucide-react";

import { FIELD_COLORS } from "./fieldColors";

/**
 * Shared shell that renders:
 *  label (+ optional info tooltip)
 *  [ colored icon box | input/select/textarea ]
 *  helper text
 *
 * `children` is a render-prop: (inputClassName) => <input .../>
 * so every concrete input keeps control of its own <input>/<select>/<textarea>.
 */
const FieldShell = ({
  label,
  info,
  icon: Icon,
  color = "orange",
  helper,
  error,
  disabled,
  textareaAlign = false,
  children,
}) => {
  const tone = FIELD_COLORS[color] || FIELD_COLORS.orange;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-semibold text-[var(--color-text)]">
            {label}
          </label>

          {info && (
            <span title={info} className="cursor-help text-gray-400">
              <Info size={14} />
            </span>
          )}
        </div>
      )}

      <div
        className={`
          flex overflow-hidden rounded-sm border bg-white transition
          focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-200
          ${error ? "border-red-300" : "border-gray-200"}
          ${disabled ? "bg-gray-50" : ""}
          ${textareaAlign ? "items-start" : "items-center"}
        `}
      >
        {Icon && (
          <div
            className={`flex shrink-0 items-center justify-center ${tone} ${
              textareaAlign ? "mt-0 self-stretch" : ""
            } px-3 py-2.5`}
          >
            <Icon size={16} />
          </div>
        )}

        {children}
      </div>

      {helper && !error && (
        <p className="text-xs text-[var(--color-text-muted)]">{helper}</p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default FieldShell;
