import { create } from "zustand";

const usePopupStore = create((set) => ({
  confirm: {
    open: false,
    title: "",
    message: "",
    action: null,
  },

  error: {
    open: false,
    title: "",
    message: "",
  },

  success: {
    open: false,
    title: "",
    message: "",
  },

  // ===== CONFIRM =====

  openConfirm: ({ title, message, action }) =>
    set({
      confirm: {
        open: true,
        title,
        message,
        action,
      },
    }),

  closeConfirm: () =>
    set((state) => ({
      confirm: {
        ...state.confirm,
        open: false,
      },
    })),

  // ===== ERROR =====

  openError: ({ title = "Error", message = "Something went wrong" }) =>
    set({
      error: {
        open: true,
        title,
        message,
      },
    }),

  closeError: () =>
    set((state) => ({
      error: {
        ...state.error,
        open: false,
      },
    })),

  // ===== SUCCESS =====

  openSuccess: ({
    title = "Success",
    message = "Operation completed successfully",
  }) =>
    set({
      success: {
        open: true,
        title,
        message,
      },
    }),

  closeSuccess: () =>
    set((state) => ({
      success: {
        ...state.success,
        open: false,
      },
    })),
}));

export default usePopupStore;
