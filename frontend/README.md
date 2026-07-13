# 土豆时钟前端

`frontend/` 同时包含土豆时钟 Web App、产品官网和 Capacitor 原生工程。

- 在线体验：[clock.cinoo.xyz](https://clock.cinoo.xyz)
- Android：[下载 APK](https://clock.cinoo.xyz/downloads/tudou-clock.apk)
- iOS：[下载未签名 IPA](https://clock.cinoo.xyz/downloads/tudou-clock.ipa)

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 基础 | React 19, TypeScript, Vite 7 |
| 路由 | React Router 7 |
| 数据 | TanStack Query, Axios, Zustand |
| UI | Tailwind CSS, Radix UI, lucide-react, motion |
| 图表 | Recharts |
| 原生能力 | Capacitor 8, Local Notifications, Haptics, Preferences |

## 开发环境

需要 Node.js 20+、Corepack 和 pnpm 10+。

```bash
corepack pnpm install
corepack pnpm dev:app
```

官网开发模式：

```bash
corepack pnpm dev:landing
```

本地变量可以从 `.env.example` 开始配置：

| 变量 | 默认示例 | 说明 |
| --- | --- | --- |
| `VITE_APP_TARGET` | `app` | `app` 或 `landing` |
| `VITE_API_BASE_URL` | `https://clock.cinoo.xyz/api` | 后端 API 基础地址 |
| `VITE_USE_MOCK` | `false` | 是否使用本地演示接口 |
| `VITE_ANDROID_APK_URL` | `/downloads/tudou-clock.apk` | 官网 Android 下载地址 |
| `VITE_IOS_IPA_URL` | `/downloads/tudou-clock.ipa` | 官网 iOS 下载地址 |
| `VITE_TESTFLIGHT_URL` | 空 | 可选 TestFlight 地址 |
| `VITE_APP_STORE_URL` | 空 | 可选 App Store 地址 |

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `corepack pnpm dev:app` | 启动 App 开发模式 |
| `corepack pnpm dev:landing` | 启动官网开发模式 |
| `corepack pnpm build:app` | 构建 App Web 资源 |
| `corepack pnpm build:landing` | 构建官网 |
| `corepack pnpm preview` | 预览构建结果 |
| `corepack pnpm cap:sync` | 构建 App 并同步全部原生工程 |
| `corepack pnpm cap:android` | 同步 Android 并打开 Android Studio |
| `corepack pnpm cap:ios` | 同步 iOS 并打开 Xcode |

## 目录结构

```text
frontend/
├── android/              # Capacitor Android 工程
├── ios/                  # Capacitor iOS 工程
├── src/
│   ├── api/              # API 客户端
│   ├── components/       # 通用与业务组件
│   ├── hooks/            # 查询和业务 hooks
│   ├── mocks/            # 游客演示数据与 mock client
│   ├── pages/            # App 页面与官网页面
│   ├── router/           # 路由
│   ├── services/         # 通知、计时、存储和生命周期
│   ├── stores/           # Zustand 状态
│   ├── theme/            # 主题配置
│   └── types/            # TypeScript 类型
├── capacitor.config.ts
├── Dockerfile
├── nginx.conf
└── package.json
```

## 构建原生应用

同步原生工程：

```bash
corepack pnpm cap:sync
```

Android 可以在 Android Studio 中构建，也可以在 Windows 上执行：

```powershell
cd android
.\gradlew.bat test lint assembleDebug
```

iOS 需要在 macOS 和 Xcode 中完成签名构建。仓库中的 [GitHub Actions 工作流](https://github.com/Cinnamo-roll/Cinta-PotatoClock/actions/workflows/build-ios-unsigned-ipa.yml) 会生成未签名的 `tudou-clock-unsigned-ipa` Artifact。

## 开发约定

- 真实 API 统一从 `VITE_API_BASE_URL` 访问，生产 Nginx 将 `/api` 转发到后端。
- 游客模式使用同一套关联演示数据，并拦截新增、编辑和删除操作。
- 通知、前台服务、状态栏和安全区改动需要同时在 Android 与 iOS 真机验证。
- 修改共享接口类型时，应同步检查后端 DTO、mock 数据和状态存储。

## 验证

提交前至少运行：

```bash
corepack pnpm build:app
corepack pnpm build:landing
```

本目录中的项目代码遵循仓库根目录的 [PolyForm Noncommercial License 1.0.0](../LICENSE)。
