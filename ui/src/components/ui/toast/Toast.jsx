import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const variants = {
  success: {
    icon: CheckCircle,
    className: "border-green-200 bg-green-50 text-green-700",
  },

  error: {
    icon: AlertCircle,
    className: "border-red-200 bg-red-50 text-red-700",
  },

  warning: {
    icon: AlertTriangle,
    className: "border-yellow-200 bg-yellow-50 text-yellow-700",
  },

  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
};

const Toast = ({ variant = "success", message, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = variants[variant] || variants.success;

  const Icon = config.icon;

  return (
    <div
      className={`
        flex min-w-[320px]
        items-start gap-3
        rounded-sm border
        p-4 shadow-lg
        ${config.className}
      `}
    >
      <Icon size={18} />

      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>

      <button onClick={onClose} className="opacity-70 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
