import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import * as Switch from "@radix-ui/react-switch";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { MobileShell } from "@/components/layout/MobileShell";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import type { UserSettings } from "@/types/settings";

function SettingRow({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-3xl bg-white/42 p-3 dark:bg-white/8">
      <div>
        <p className="font-bold text-soil dark:text-cream">{label}</p>
        {hint ? <p className="text-xs text-soil/55 dark:text-cream/55">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

function CuteSwitch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="relative h-7 w-12 rounded-full bg-soil/20 data-[state=checked]:bg-leaf dark:bg-white/12"
    >
      <Switch.Thumb className="block h-6 w-6 translate-x-0.5 rounded-full bg-white shadow transition data-[state=checked]:translate-x-[22px]" />
    </Switch.Root>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const logout = useAuthStore((state) => state.logout);
  const toast = useUiStore((state) => state.toast);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const patchSettings = async (payload: Partial<UserSettings>) => {
    await updateSettings(payload);
    toast({ title: "设置已保存", description: "已更新您的专注节奏", tone: "success" });
  };

  const numberInput = (key: keyof Pick<UserSettings, "focusMinutes" | "shortBreakMinutes" | "longBreakMinutes" | "longBreakInterval">) => (
    <Input
      className="h-11 w-24 text-center"
      type="number"
      min={1}
      value={settings[key]}
      onChange={(event) => void patchSettings({ [key]: Number(event.target.value) })}
    />
  );

  return (
    <MobileShell>
      <div className="space-y-5">
        <PageHeader title="设置" description="调整专注节奏和提醒方式" />
        <SettingsSection title="时间节奏" description="默认 25 / 5 / 15，也可以按自己的状态微调。">
          <SettingRow label="默认专注时长" hint="一次专注默认多久">
            {numberInput("focusMinutes")}
          </SettingRow>
          <SettingRow label="小憩时间" hint="短短晾一晾">
            {numberInput("shortBreakMinutes")}
          </SettingRow>
          <SettingRow label="大休息时间" hint="多次专注后的长休息">
            {numberInput("longBreakMinutes")}
          </SettingRow>
          <SettingRow label="长休息间隔" hint="几次专注后进入大休息">
            {numberInput("longBreakInterval")}
          </SettingRow>
        </SettingsSection>
        <SettingsSection title="提醒设置" description="用柔和的声音和震动提醒你回来。">
          <SettingRow label="自动开始休息">
            <CuteSwitch checked={settings.autoStartBreak} onCheckedChange={(checked) => void patchSettings({ autoStartBreak: checked })} />
          </SettingRow>
          <SettingRow label="自动开始下一轮专注">
            <CuteSwitch checked={settings.autoStartNextFocus} onCheckedChange={(checked) => void patchSettings({ autoStartNextFocus: checked })} />
          </SettingRow>
          <SettingRow label="声音提醒">
            <CuteSwitch checked={settings.soundEnabled} onCheckedChange={(checked) => void patchSettings({ soundEnabled: checked })} />
          </SettingRow>
          <SettingRow label="震动提醒">
            <CuteSwitch checked={settings.vibrationEnabled} onCheckedChange={(checked) => void patchSettings({ vibrationEnabled: checked })} />
          </SettingRow>
        </SettingsSection>
        <SettingsSection title="主题模式" description="选择适合当前环境的显示方式。">
          <ThemeToggle value={settings.theme} onChange={(theme) => void patchSettings({ theme })} />
        </SettingsSection>
        <Button
          className="w-full"
          variant="danger"
          onClick={() => setLogoutConfirmOpen(true)}
        >
          <LogOut size={18} />
          退出登录
        </Button>
        <ConfirmDialog
          open={logoutConfirmOpen}
          title="确认退出登录？"
          description="退出后会回到登录页，未完成的本地计时请先结束。"
          confirmText="退出登录"
          tone="danger"
          onOpenChange={setLogoutConfirmOpen}
          onConfirm={() => {
            setLogoutConfirmOpen(false);
            logout();
            toast({ title: "已经退出登录", description: "欢迎下次回来继续专注" });
            navigate("/login", { replace: true });
          }}
        />
      </div>
    </MobileShell>
  );
}
