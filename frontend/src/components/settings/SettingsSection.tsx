import type { ReactNode } from "react";
import { Card } from "@/components/common/Card";

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-base font-black text-soil dark:text-cream">{title}</h2>
        {description ? <p className="mt-1 text-sm text-soil/60 dark:text-cream/60">{description}</p> : null}
      </div>
      <div className="space-y-3">{children}</div>
    </Card>
  );
}
