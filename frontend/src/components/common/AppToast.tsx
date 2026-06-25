import { Toaster as SonnerToaster } from "sonner";

export function AppToast() {
  return <SonnerToaster richColors closeButton position="top-center" toastOptions={{ style: { borderRadius: "18px" } }} />;
}
