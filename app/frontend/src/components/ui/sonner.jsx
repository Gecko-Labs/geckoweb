import { Toaster as Sonner } from "sonner";

export function Toaster({ theme = "system", ...props }) {
  return <Sonner theme={theme} {...props} />;
}
