import React from "react";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ size = 24 }) => {
  return (
    <Loader2 size={size} className="animate-spin text-[var(--color-primary)]" />
  );
};

export default LoadingSpinner;
