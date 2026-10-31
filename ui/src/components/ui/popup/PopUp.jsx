import { useEffect, useState } from "react";
import { X } from "lucide-react";

const PopUp = ({
  open,
  onClose,

  title,
  children,

  width = "max-w-4xl",

  closeOnEsc = true,
  closeOnOverlay = true,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [open]);

  useEffect(() => {
    if (!closeOnEsc) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, closeOnEsc]);

  if (!open) return null;

  return (
    <div
      onClick={() => closeOnOverlay && onClose?.()}
      className={`
        fixed inset-0 z-[9999]
        flex items-center justify-center
        p-4
        transition-all duration-200
        ${visible ? "bg-black/50 opacity-100" : "bg-black/0 opacity-0"}
      `}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          w-full ${width}
          rounded-sm border border-gray-200
          bg-white shadow-xl
          transition-all duration-200
          ${
            visible
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-4 scale-95 opacity-0"
          }
        `}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>

          <button
            onClick={onClose}
            className="rounded-sm p-2 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
};

export default PopUp;
