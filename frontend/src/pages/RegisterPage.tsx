import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { CutePotatoLogo } from "@/components/common/CutePotatoLogo";
import { Input } from "@/components/common/Input";
import { MobileShell } from "@/components/layout/MobileShell";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";

export default function RegisterPage() {
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const toast = useUiStore((state) => state.toast);
  const [form, setForm] = useState({ username: "", nickname: "", email: "", password: "", confirmPassword: "" });

  const setValue = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const validate = () => {
    const username = form.username.trim();
    const nickname = form.nickname.trim() || username;
    const email = form.email.trim();
    if (!username) return "用户名不能为空";
    if (!/^[A-Za-z][A-Za-z0-9_]{2,19}$/.test(username)) return "用户名需为 3-20 位，以字母开头，只能包含字母、数字和下划线";
    if (nickname.length > 20) return "昵称最多 20 个字符";
    if (email.length > 100) return "邮箱最多 100 个字符";
    if (form.password.length < 6) return "密码至少 6 位";
    if (form.password.length > 72) return "密码最多 72 位";
    if (!/\S/.test(form.password)) return "密码不能全是空格";
    if (form.password !== form.confirmPassword) return "两次密码必须一致";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "邮箱格式看起来不太对";
    return "";
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const message = validate();
    if (message) {
      toast({ title: "信息还没填写完整", description: message, tone: "error" });
      return;
    }
    try {
      await register({
        username: form.username.trim(),
        nickname: form.nickname.trim() || form.username.trim(),
        email: form.email.trim() || undefined,
        password: form.password
      });
      toast({ title: "账号已创建", description: "去开始第一次专注吧", tone: "success" });
      window.location.replace("/");
    } catch (error) {
      toast({ title: "注册失败啦", description: error instanceof Error ? error.message : "稍后再试试", tone: "error" });
    }
  };

  return (
    <MobileShell withNav={false} className="py-7">
      <section className="mx-auto w-full max-w-[380px]">
        <CutePotatoLogo />
        <div className="mt-4 text-center">
          <h1 className="app-brand-title text-[34px] font-black leading-none tracking-normal">创建账号</h1>
          <p className="app-brand-subtitle mt-2 text-sm font-black">一个待办，一段安静时间</p>
        </div>
        <Card className="mt-6 p-5 sm:p-6">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input value={form.username} onChange={(event) => setValue("username", event.target.value)} placeholder="用户名，3-20 位字母数字下划线" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={20} />
          <Input value={form.nickname} onChange={(event) => setValue("nickname", event.target.value)} placeholder="昵称，最多 20 字" autoComplete="nickname" maxLength={20} />
          <Input value={form.email} onChange={(event) => setValue("email", event.target.value)} placeholder="邮箱，可选" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={100} />
          <Input value={form.password} onChange={(event) => setValue("password", event.target.value)} placeholder="密码，6-72 位" type="password" autoComplete="new-password" maxLength={72} />
          <Input value={form.confirmPassword} onChange={(event) => setValue("confirmPassword", event.target.value)} placeholder="确认密码" type="password" autoComplete="new-password" maxLength={72} />
          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? "正在种下..." : "注册"}
          </Button>
        </form>
        <div className="mt-5 flex min-h-9 items-center justify-center gap-2 text-sm">
          <span className="font-semibold text-[var(--app-muted)]">已经有账号？</span>
          <Link className="inline-flex min-h-9 items-center rounded-full border border-[var(--app-border)] bg-[var(--app-card-soft)] px-3 font-black text-[var(--app-primary-strong)] transition active:scale-[0.97]" to="/login">
            去登录
          </Link>
        </div>
        </Card>
      </section>
    </MobileShell>
  );
}
