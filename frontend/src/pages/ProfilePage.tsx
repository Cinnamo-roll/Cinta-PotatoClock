import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AtSign, Award, ChevronRight, Globe2, HelpCircle, KeyRound, LogOut, Mail, Palette, PenLine, UserRound, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { MobileShell } from "@/components/layout/MobileShell";
import { AchievementEntry, buildAchievements } from "@/components/stats/AchievementEntry";
import { ThemePanel } from "@/components/theme/ThemePanel";
import { useStatsQuery } from "@/hooks/useApiQueries";
import { officialSiteUrl, openExternalLink } from "@/services/externalLinkService";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";

const feedbackEmail = "D003421@163.com";

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[var(--app-card-soft)] px-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--app-card)_78%,transparent)] text-[var(--app-primary-strong)]">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-[var(--app-muted)]">{label}</p>
        <p className="mt-0.5 truncate text-sm font-black text-[var(--app-text)]">{value}</p>
      </div>
    </div>
  );
}

function SettingRow({
  icon,
  title,
  description,
  onClick,
  href,
  danger = false
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}) {
  const content = (
    <>
      <span
        className={
          danger
            ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--app-danger)_12%,var(--app-card))] text-[var(--app-danger)]"
            : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]"
        }
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={danger ? "block text-sm font-black text-[var(--app-danger)]" : "block text-sm font-black text-[var(--app-text)]"}>{title}</span>
        {description ? <span className="mt-0.5 block text-xs font-semibold leading-5 text-[var(--app-muted)]">{description}</span> : null}
      </span>
      {!danger ? <ChevronRight className="shrink-0 text-[var(--app-muted)]" size={18} /> : null}
    </>
  );

  const className = "flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition active:bg-[var(--app-card-soft)]";

  if (href) {
    return (
      <a className={className} href={href} aria-label={title}>
        {content}
      </a>
    );
  }

  return (
    <button className={className} onClick={onClick} aria-label={title} type="button">
      {content}
    </button>
  );
}

function Divider() {
  return <div className="mx-4 border-t border-[color-mix(in_srgb,var(--app-border)_72%,transparent)]" />;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const changePassword = useAuthStore((state) => state.changePassword);
  const isLoading = useAuthStore((state) => state.isLoading);
  const toast = useUiStore((state) => state.toast);
  const [themeOpen, setThemeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [achievementOpen, setAchievementOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ nickname: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const { data: statsData } = useStatsQuery();
  const achievementText = statsData
    ? (() => {
        const achievements = buildAchievements(statsData.summary, statsData);
        const unlocked = achievements.filter((item) => item.current >= item.target).length;
        return `已解锁 ${unlocked}/${achievements.length} 枚，查看成就墙`;
      })()
    : "正在整理你的成就墙";

  useEffect(() => {
    void fetchMe().catch(() => undefined);
  }, [fetchMe]);

  useEffect(() => {
    setProfileForm({ nickname: user?.nickname ?? user?.username ?? "", email: user?.email ?? "" });
  }, [user?.email, user?.nickname, user?.username]);

  const submitProfile = async (event: FormEvent) => {
    event.preventDefault();
    const nickname = profileForm.nickname.trim();
    const email = profileForm.email.trim();
    if (!nickname) {
      toast({ title: "昵称不能为空", tone: "error" });
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "邮箱格式不正确", tone: "error" });
      return;
    }
    try {
      await updateProfile({ nickname, email });
      setProfileOpen(false);
      toast({ title: "资料已更新", tone: "success" });
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "资料保存失败", tone: "error" });
    }
  };

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!passwordForm.oldPassword) {
      toast({ title: "请输入当前密码", tone: "error" });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({ title: "新密码至少 6 位", tone: "error" });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "两次输入的新密码不一致", tone: "error" });
      return;
    }
    try {
      await changePassword(passwordForm);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordOpen(false);
      toast({ title: "密码已更新", description: "下次登录请使用新密码", tone: "success" });
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "密码修改失败", tone: "error" });
    }
  };

  const feedbackHref = `mailto:${feedbackEmail}?subject=${encodeURIComponent("土豆时钟反馈")}`;
  const openOfficialSite = () => {
    toast({
      title: "正在打开土豆时钟官网",
      description: "会跳到手机浏览器，App 会留在当前页面。",
      durationMs: 3600
    });
    void openExternalLink(officialSiteUrl).catch(() => {
      toast({
        title: "官网暂时打不开",
        description: "也可以在浏览器输入 clock.cinoo.xyz。",
        tone: "error",
        durationMs: 7000
      });
    });
  };

  return (
    <MobileShell>
      <div className="space-y-4 pt-1">
        <Card className="space-y-4 bg-[linear-gradient(135deg,var(--app-card)_0%,var(--app-card-soft)_100%)]">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--app-card)_70%,transparent)]">
              <UserRound size={30} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-[var(--app-primary-strong)]">我的账号</p>
              <h1 className="mt-1 truncate text-xl font-black text-[var(--app-text)]">{user?.nickname || user?.username || "土豆用户"}</h1>
              <p className="mt-1 truncate text-sm font-semibold text-[var(--app-muted)]">@{user?.username || "potato"}</p>
            </div>
            <button className="app-header-button" onClick={() => setProfileOpen(true)} aria-label="快速编辑资料" type="button">
              <PenLine size={18} />
            </button>
          </div>
          <div className="grid gap-2">
            <InfoRow icon={<AtSign size={17} />} label="账号" value={user?.username || "未登录"} />
            <InfoRow icon={<UserRound size={17} />} label="昵称" value={user?.nickname || "未设置"} />
            <InfoRow icon={<Mail size={17} />} label="邮箱" value={user?.email || "未设置"} />
          </div>
        </Card>

        <Card className="p-0">
          <div className="px-4 pb-2 pt-4">
            <h2 className="text-sm font-black text-[var(--app-text)]">个人资料与偏好</h2>
          </div>
          <SettingRow icon={<PenLine size={19} />} title="编辑资料" description="修改昵称和邮箱" onClick={() => setProfileOpen(true)} />
          <Divider />
          <SettingRow icon={<KeyRound size={19} />} title="修改密码" description="修改账号密码" onClick={() => setPasswordOpen(true)} />
          <Divider />
          <SettingRow
            icon={<Award size={19} />}
            title="查看所有成就"
            description={achievementText}
            onClick={() => setAchievementOpen(true)}
          />
          <Divider />
          <SettingRow icon={<Palette size={19} />} title="主题颜色" description="切换全局配色" onClick={() => setThemeOpen(true)} />
        </Card>

        <Card className="p-0">
          <div className="px-4 pb-2 pt-4">
            <h2 className="text-sm font-black text-[var(--app-text)]">关于与帮助</h2>
          </div>
          <SettingRow icon={<Globe2 size={19} />} title="关于我们" description="用手机浏览器打开土豆时钟官网，App 会保持在当前页面。" onClick={openOfficialSite} />
          <Divider />
          <SettingRow icon={<HelpCircle size={19} />} title="使用说明" description="更完整的操作说明会在后续版本补充。" />
          <Divider />
          <SettingRow icon={<Mail size={19} />} title="反馈入口" description={`遇到问题或有建议，可以发邮件到 ${feedbackEmail}`} href={feedbackHref} />
        </Card>

        <Card className="p-0">
          <SettingRow
            danger
            icon={<LogOut size={19} />}
            title="退出登录"
            description="退出当前账号，回到登录页"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          />
        </Card>
      </div>

      <Dialog.Root open={profileOpen} onOpenChange={setProfileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(38,35,42,0.18)]" />
          <Dialog.Content className="app-dialog-panel app-modal-scroll z-50 max-h-[90vh] w-[calc(100%-40px)] max-w-[380px] rounded-[28px] p-5">
            <Dialog.Close className="absolute right-4 top-4 rounded-full bg-[var(--app-primary-soft)] p-2 text-[var(--app-text)]" aria-label="关闭">
              <X size={16} />
            </Dialog.Close>
            <Dialog.Title className="text-xl font-black text-[var(--app-text)]">编辑资料</Dialog.Title>
            <form className="mt-5 space-y-3" onSubmit={(event) => void submitProfile(event)}>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-[var(--app-muted)]">昵称</span>
                <Input value={profileForm.nickname} onChange={(event) => setProfileForm((form) => ({ ...form, nickname: event.target.value }))} maxLength={50} placeholder="输入昵称" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-[var(--app-muted)]">邮箱</span>
                <Input value={profileForm.email} onChange={(event) => setProfileForm((form) => ({ ...form, email: event.target.value }))} maxLength={120} placeholder="输入邮箱，可留空" inputMode="email" />
              </label>
              <Button className="w-full" disabled={isLoading} type="submit">
                保存资料
              </Button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={passwordOpen} onOpenChange={setPasswordOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(38,35,42,0.18)]" />
          <Dialog.Content className="app-dialog-panel app-modal-scroll z-50 max-h-[90vh] w-[calc(100%-40px)] max-w-[380px] rounded-[28px] p-5">
            <Dialog.Close className="absolute right-4 top-4 rounded-full bg-[var(--app-primary-soft)] p-2 text-[var(--app-text)]" aria-label="关闭">
              <X size={16} />
            </Dialog.Close>
            <Dialog.Title className="text-xl font-black text-[var(--app-text)]">修改密码</Dialog.Title>
            <form className="mt-5 space-y-3" onSubmit={(event) => void submitPassword(event)}>
              <Input value={passwordForm.oldPassword} onChange={(event) => setPasswordForm((form) => ({ ...form, oldPassword: event.target.value }))} placeholder="当前密码" type="password" autoComplete="current-password" />
              <Input value={passwordForm.newPassword} onChange={(event) => setPasswordForm((form) => ({ ...form, newPassword: event.target.value }))} placeholder="新密码，至少 6 位" type="password" autoComplete="new-password" />
              <Input value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((form) => ({ ...form, confirmPassword: event.target.value }))} placeholder="确认新密码" type="password" autoComplete="new-password" />
              <Button className="w-full" disabled={isLoading} type="submit">
                更新密码
              </Button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ThemePanel open={themeOpen} onOpenChange={setThemeOpen} />
      {statsData ? <AchievementEntry open={achievementOpen} summary={statsData.summary} stats={statsData} onClose={() => setAchievementOpen(false)} /> : null}
    </MobileShell>
  );
}
