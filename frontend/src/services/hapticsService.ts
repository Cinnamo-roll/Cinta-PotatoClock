import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { isNativeApp } from "@/lib/capacitor";

export async function lightImpact() {
  if (!isNativeApp) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Web preview or unsupported devices should stay quiet.
  }
}

export async function successFeedback() {
  if (!isNativeApp) return;
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    // Safe fallback for web preview.
  }
}

export async function warningFeedback() {
  if (!isNativeApp) return;
  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch {
    // Safe fallback for web preview.
  }
}
