import { Toaster as SonnerToaster } from "sonner";

export function AppToast() {
  return <SonnerToaster richColors closeButton position="top-center" offset="calc(var(--safe-top) + 12px)" toastOptions={{ style: { borderRadius: "18px" } }} />;
}
