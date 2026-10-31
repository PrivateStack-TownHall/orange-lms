import PopUp from "./PopUp";

import Button from "../buttons/Button";

const ErrorPopUp = ({
  open,
  onClose,

  title = "Error",

  message = "Something went wrong.",
}) => {
  return (
    <PopUp open={open} onClose={onClose} title={title} width="max-w-md">
      <div className="space-y-4">
        <p className="text-sm text-red-600">{message}</p>

        <Button variant="danger" className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </PopUp>
  );
};

export default ErrorPopUp;
