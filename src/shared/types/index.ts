export type ToastType = "success" | "error" | "warning" | "info" | "loading";

export interface ToastProps {
  title: string;
  description?: string;
  duration?: number;
}