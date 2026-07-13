import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Lock, UserRound } from "lucide-react";
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
    <MobileShell withNav={false} className="flex min-h-screen items-center justify-center py-8">
      <section className="w-full">
        <CutePotatoLogo size="lg" />
        <div className="mt-5 text-center">
          <h1 className="app-brand-title text-[34px] font-black leading-none tracking-normal">土豆时钟ToDo</h1>
          <p className="app-brand-subtitle mt-2 text-sm font-black">记录待办，开始专注</p>
        </div>
        <Card className="mt-7">
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
          <p className="mt-5 text-center text-sm text-soil/60 dark:text-cream/60">
            还没有账号？
            <Link className="font-bold text-caramel dark:text-potato" to="/register">
              去注册
            </Link>
          </p>
          <Link className="mt-3 flex min-h-10 items-center justify-center rounded-2xl text-sm font-black text-[var(--app-accent)] transition hover:bg-[var(--app-card-soft)]" to="/">
            先预览全部功能
          </Link>
        </Card>
      </section>
    </MobileShell>
  );
}
