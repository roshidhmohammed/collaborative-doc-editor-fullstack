import { ToastProps } from "@/shared/types";
import { toast } from "sonner";

export const AppToast = {
  success({ title, description, duration = 5000 }: ToastProps) {
    toast.success(title, {
      description,
      duration,
    });
  },

  error({ title, description, duration = 4000 }: ToastProps) {
    toast.error(title, {
      description,
      duration,
    });
  },

  warning({ title, description, duration = 3000 }: ToastProps) {
    toast.warning(title, {
      description,
      duration,
    });
  },

  info({ title, description, duration = 3000 }: ToastProps) {
    toast.info(title, {
      description,
      duration,
    });
  },

  loading(title: string) {
    return toast.loading(title);
  },

  dismiss(id?: string | number) {
    toast.dismiss(id);
  },

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
  ) {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },
};
