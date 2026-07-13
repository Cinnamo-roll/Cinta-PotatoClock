import confetti from "canvas-confetti";
import { useState } from "react";
import { useCreateCheckinMutation } from "@/hooks/useApiQueries";
import { buildCheckinPayload, buildCheckinToast, checkinFailureHint, checkinNeedsNote, checkinWindowError, checkinWindowHint, type CheckinType } from "@/services/checkinService";
import { lightImpact, successFeedback } from "@/services/hapticsService";
import { useUiStore } from "@/stores/uiStore";

function celebrateCheckin(type: CheckinType) {
  void successFeedback();
  const x = type === "sleep" ? 0.72 : type === "wakeup" ? 0.28 : 0.5;
  confetti({
    colors: ["#D7AD4A", "#6F8655", "#FFF9ED", "#E9C66C"],
    origin: { x, y: 0.2 },
    particleCount: type === "focus_today" ? 72 : 52,
    scalar: 0.82,
    spread: 58,
    startVelocity: 34,
    ticks: 120
  });
}

export function useQuickCheckin() {
  const createCheckin = useCreateCheckinMutation();
  const toast = useUiStore((state) => state.toast);
  const [noteType, setNoteType] = useState<CheckinType | null>(null);

  const quickToast = (title: string, tone: "success" | "error" = "success", description?: string, durationMs?: number) => {
    void lightImpact();
    toast({ title, description, tone, durationMs });
  };

  const submitCheckin = async (type: CheckinType, note?: string) => {
    const checkinDate = new Date();
    const windowError = checkinWindowError(type, checkinDate);
    if (windowError) {
      quickToast(windowError, "error", checkinWindowHint(type), 8000);
      return;
    }

    try {
      await createCheckin.mutateAsync(buildCheckinPayload(type, checkinDate, note));
      const message = buildCheckinToast(type, checkinDate);
      celebrateCheckin(type);
      quickToast(message.title, "success", message.description, 6000);
    } catch (error) {
      const message = checkinFailureHint(type, error instanceof Error ? error.message : undefined);
      quickToast(message.title, "error", message.description, 8000);
    }
  };

  const startQuickCheckin = (type: CheckinType) => {
    const checkinDate = new Date();
    const windowError = checkinWindowError(type, checkinDate);
    if (windowError) {
      quickToast(windowError, "error", checkinWindowHint(type), 8000);
      return;
    }
    if (checkinNeedsNote(type)) {
      setNoteType(type);
      return;
    }
    void submitCheckin(type);
  };

  const submitNoteCheckin = (note: string) => {
    if (!noteType) return;
    const type = noteType;
    setNoteType(null);
    void submitCheckin(type, note);
  };

  return {
    noteType,
    noteSubmitting: createCheckin.isPending,
    closeNoteDialog: () => setNoteType(null),
    startQuickCheckin,
    submitNoteCheckin
  };
}
