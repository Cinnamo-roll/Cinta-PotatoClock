import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Eye, Lock, UserRound } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { CutePotatoLogo } from "@/components/common/CutePotatoLogo";
import { Input } from "@/components/common/Input";
import { MobileShell } from "@/components/layout/MobileShell";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";

export default function LoginPage() {
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const toast = useUiStore((state) => state.toast);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const returnPath = (location.state as { from?: string } | null)?.from || "/";

  useEffect(() => {
    if (isAuthenticated) window.location.replace(returnPath);
  }, [isAuthenticated, returnPath]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password) {
      toast({ title: "请填写用户名和密码", tone: "error" });
      return;
    }
    try {
      await login({ username: normalizedUsername, password });
      toast({ title: "欢迎回来", description: "今天也要保持专注", tone: "success" });
      window.location.replace(returnPath);
    } catch (error) {
      toast({ title: "登录失败啦", description: error instanceof Error ? error.message : "检查一下用户名或密码", tone: "error" });
    }
  };

  return (
    <MobileShell withNav={false} className="flex min-h-dvh items-center justify-center py-7">
      <section className="mx-auto w-full max-w-[380px]">
        <CutePotatoLogo size="lg" />
        <div className="mt-5 text-center">
          <h1 className="app-brand-title text-[34px] font-black leading-none tracking-normal">土豆时钟ToDo</h1>
          <p className="app-brand-subtitle mt-2 text-sm font-black">记录待办，开始专注</p>
        </div>
        <Card className="mt-7 p-5 sm:p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="flex items-center gap-2 text-sm font-bold text-soil/75 dark:text-cream/75">
                <UserRound size={16} />
                用户名
              </span>
              <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="输入用户名" autoComplete="username" autoCapitalize="none" spellCheck={false} />
            </label>
            <label className="block space-y-2">
              <span className="flex items-center gap-2 text-sm font-bold text-soil/75 dark:text-cream/75">
                <Lock size={16} />
                密码
              </span>
              <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="输入密码" type="password" autoComplete="current-password" />
            </label>
            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? "正在登录..." : "登录"}
            </Button>
          </form>
          <div className="mt-5 flex min-h-9 items-center justify-center gap-2 text-sm">
            <span className="font-semibold text-[var(--app-muted)]">还没有账号？</span>
            <Link className="inline-flex min-h-9 items-center rounded-full border border-[var(--app-border)] bg-[var(--app-card-soft)] px-3 font-black text-[var(--app-primary-strong)] transition active:scale-[0.97]" to="/register">
              去注册
            </Link>
          </div>
          <Link className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[color-mix(in_srgb,var(--app-primary)_38%,var(--app-border))] bg-[var(--app-primary-soft)] px-4 text-sm font-black text-[var(--app-primary-strong)] transition active:scale-[0.98]" to="/">
            <Eye size={17} />
            先预览全部功能
          </Link>
        </Card>
      </section>
    </MobileShell>
  );
}
