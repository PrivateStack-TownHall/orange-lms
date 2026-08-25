import PopUp from "./PopUp";
import Button from "../buttons/Button";

const ConfirmPopUp = ({
  open,
  onClose,
  onConfirm,

  title = "Confirmation",
  message = "Are you sure?",

  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}) => {
  return (
    <PopUp open={open} onClose={onClose} title={title} width="max-w-md">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{message}</p>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            {cancelLabel}
          </Button>

          <Button variant="danger" className="flex-1" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </PopUp>
  );
};

export default ConfirmPopUp;
