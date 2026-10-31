import PopUp from "./PopUp";

import Button from "../buttons/Button";

const SuccessPopUp = ({
  open,
  onClose,

  title = "Success",

  message = "Operation completed successfully.",
}) => {
  return (
    <PopUp open={open} onClose={onClose} title={title} width="max-w-md">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{message}</p>

        <Button variant="success" className="w-full" onClick={onClose}>
          OK
        </Button>
      </div>
    </PopUp>
  );
};

export default SuccessPopUp;
