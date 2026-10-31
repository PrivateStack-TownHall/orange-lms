import ConfirmPopUp from "@/components/ui/popup/ConfirmPopUp";
import ErrorPopUp from "@/components/ui/popup/ErrorPopUp";
import SuccessPopUp from "@/components/ui/popup/SuccessPopUp";

import usePopupStore from "@/app/store/popupStore";

const PopupProvider = () => {
  const {
    confirm,
    error,
    success,

    closeConfirm,
    closeError,
    closeSuccess,
  } = usePopupStore();

  return (
    <>
      <ConfirmPopUp
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        onClose={closeConfirm}
        onConfirm={async () => {
          try {
            await confirm.action?.();
          } catch (error) {
            console.error(error);
          } finally {
            closeConfirm();
          }
        }}
      />

      <ErrorPopUp
        open={error.open}
        title={error.title}
        message={error.message}
        onClose={closeError}
      />

      <SuccessPopUp
        open={success.open}
        title={success.title}
        message={success.message}
        onClose={closeSuccess}
      />
    </>
  );
};

export default PopupProvider;
