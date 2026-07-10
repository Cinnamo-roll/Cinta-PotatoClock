import { useEffect, useState } from "react";
import { localDateKey } from "@/utils/date";

function millisecondsUntilTomorrow() {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Math.max(1000, tomorrow.getTime() - now.getTime() + 250);
}

export function useTodayKey() {
  const [today, setToday] = useState(() => localDateKey());

  useEffect(() => {
    let timer = 0;
    const refresh = () => {
      setToday(localDateKey());
      window.clearTimeout(timer);
      timer = window.setTimeout(refresh, millisecondsUntilTomorrow());
    };
    const onVisibilityChange = () => {
      if (!document.hidden) refresh();
    };
    refresh();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return today;
}
