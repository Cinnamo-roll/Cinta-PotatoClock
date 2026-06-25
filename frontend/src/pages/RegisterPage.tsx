import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { CutePotatoLogo } from "@/components/common/CutePotatoLogo";
import { Input } from "@/components/common/Input";
import { MobileShell } from "@/components/layout/MobileShell";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const toast = useUiStore((state) => state.toast);
  const [form, setForm] = useState({ username: "", nickname: "", email: "", password: "", confirmPassword: "" });

  const setValue = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const validate = () => {
    if (!form.username.trim()) return "用户名不能为空";
    if (form.password.length < 6) return "密码至少 6 位";
    if (form.password !== form.confirmPassword) return "两次密码必须一致";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "邮箱格式看起来不太对";
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
        username: form.username,
        nickname: form.nickname || form.username,
        email: form.email || undefined,
        password: form.password
      });
      toast({ title: "账号已创建", description: "去开始第一次专注吧", tone: "success" });
      navigate("/", { replace: true });
    } catch (error) {
      toast({ title: "注册失败啦", description: error instanceof Error ? error.message : "稍后再试试", tone: "error" });
    }
  };

  return (
    <MobileShell withNav={false} className="py-8">
      <CutePotatoLogo />
      <div className="mt-4 text-center">
        <h1 className="app-brand-title text-[34px] font-black leading-none tracking-normal">创建账号</h1>
        <p className="app-brand-subtitle mt-2 text-sm font-black">一个待办，一段安静时间</p>
      </div>
      <Card className="mt-6">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input value={form.username} onChange={(event) => setValue("username", event.target.value)} placeholder="用户名" autoComplete="username" />
          <Input value={form.nickname} onChange={(event) => setValue("nickname", event.target.value)} placeholder="昵称" />
          <Input value={form.email} onChange={(event) => setValue("email", event.target.value)} placeholder="邮箱，可选" inputMode="email" />
          <Input value={form.password} onChange={(event) => setValue("password", event.target.value)} placeholder="密码，至少 6 位" type="password" />
          <Input value={form.confirmPassword} onChange={(event) => setValue("confirmPassword", event.target.value)} placeholder="确认密码" type="password" />
          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? "正在种下..." : "注册"}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-soil/60 dark:text-cream/60">
          已经有账号？
          <Link className="font-bold text-caramel dark:text-potato" to="/login">
            去登录
          </Link>
        </p>
      </Card>
    </MobileShell>
  );
}
