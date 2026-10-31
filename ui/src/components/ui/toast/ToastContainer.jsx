import React from "react";

import Toast from "./Toast";

const ToastContainer = ({ toasts = [], removeToast }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed right-5 top-5 z-[9999] flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          open
          variant={toast.variant}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
