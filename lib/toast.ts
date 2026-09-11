import { toast as shadcnToast } from "@/components/ui/toast";

type ToastType = "success" | "info" | "warning" | "error" | "loading";
type ToastPriority = "low" | "high";

interface ToastOptions {
  title?: string;
  description?: string;
  timeout?: number;
  type?: ToastType;
  priority?: ToastPriority;
  actionProps?: {
    children: React.ReactNode;
    onClick: () => void;
  };
}

function createToast(message: string, options: ToastOptions = {}) {
  const { description, timeout, actionProps, type, priority } = options;

  return shadcnToast.add({
    title: message,
    description,
    timeout,
    actionProps,
    type,
    priority,
  });
}

export const toast = {
  default: (message: string, description?: string) =>
    createToast(message, { description }),

  success: (message: string, description?: string) =>
    createToast(message, { description, type: "success" }),

  error: (message: string, description?: string) =>
    createToast(message, { description, type: "error", priority: "high" }),

  warning: (message: string, description?: string) =>
    createToast(message, { description, type: "warning" }),

  info: (message: string, description?: string) =>
    createToast(message, { description, type: "info" }),

  loading: (message: string, description?: string) =>
    createToast(message, { description, type: "loading" }),

  action: (
    message: string,
    actionLabel: string,
    onAction: () => void,
    options?: Omit<ToastOptions, "actionProps">
  ) =>
    createToast(message, {
      ...options,
      actionProps: { children: actionLabel, onClick: onAction },
    }),

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    }
  ) =>
    shadcnToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    }),

  raw: shadcnToast,
};

export default toast;