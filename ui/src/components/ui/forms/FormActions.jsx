import React from "react";

import Button from "../buttons/Button";

const FormActions = ({ submitLabel = "Save" }) => {
  return (
    <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
      <Button type="submit">{submitLabel}</Button>
    </div>
  );
};

export default FormActions;
