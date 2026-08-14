import { ReactNode } from "react";

export interface Props {
  label: string;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
}
