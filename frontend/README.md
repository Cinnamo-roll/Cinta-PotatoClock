# 土豆时钟前端

这里是土豆时钟的前端工程，承担两种产物：

- App 体验：移动端优先的 React Web App，并通过 Capacitor 打包成 Android / iOS 应用。
- 官网体验：`clock.cinoo.xyz` 的产品介绍页，展示功能截图和安装包下载入口。

## 技术栈

- React 19 + TypeScript + Vite 7
- React Router 7、TanStack Query、Zustand、Axios
- Tailwind CSS、Radix UI、lucide-react、motion、sonner
- Recharts、canvas-confetti
- Capacitor 8：Android、iOS、Local Notifications、Haptics、Preferences、Network、Status Bar、Splash Screen、InAppBrowser

## 目录说明

```text
frontend/
├── android/                 # Capacitor Android 工程
├── ios/                     # Capacitor iOS 工程
├── src/
│   ├── api/                 # HTTP API 和 mock/真实接口切换
│   ├── components/          # 通用组件、业务组件、官网展示组件
│   ├── hooks/               # TanStack Query hooks
│   ├── lib/                 # Capacitor 环境判断等基础能力
│   ├── mocks/               # 本地 mock 数据与 mock client
│   ├── pages/               # App 页面和官网页面
│   ├── router/              # 路由入口
│   ├── services/            # 通知、声音、震动、打卡、存储、生命周期
│   ├── stores/              # auth/settings/timer/ui 状态
│   ├── types/               # 前端类型定义
│   └── utils/               # 格式化、统计、样式辅助函数
├── capacitor.config.ts      # Capacitor 配置
├── Dockerfile               # 官网生产镜像
└── nginx.conf               # 官网静态服务和 /api 反代
```

## 环境变量

常用变量：

- `VITE_APP_TARGET=app | landing`：控制构建 App 还是官网。
- `VITE_API_BASE_URL=/api`：真实 API 地址。
- `VITE_USE_MOCK=true | false`：是否启用 mock。
- `VITE_ANDROID_DOWNLOAD_URL=/downloads/potato-clock.apk`：官网 APK 下载地址。
- `VITE_IOS_DOWNLOAD_URL=/downloads/potato-clock.ipa`：官网 IPA 下载地址。

## 常用命令

```bash
corepack pnpm install
corepack pnpm dev:app
corepack pnpm dev:landing
corepack pnpm build:app
corepack pnpm build:landing
corepack pnpm preview
```

Capacitor：

```bash
corepack pnpm cap:sync
corepack pnpm cap:android
corepack pnpm cap:ios
```

`cap:android` 会打开 Android Studio，`cap:ios` 会打开 Xcode。iOS 打包仍需要 macOS、Xcode、签名证书和对应 Apple 开发者配置。

## App 功能结构

- 首页：待办列表、待办集、快速创建、排序和操作入口。
- 专注页：倒计时、正计时、手动完成、暂停、放弃、声音和震动反馈。
- 统计页：今日、月度、年度、日历历史、打断原因、时段分布、待办维度。
- 打卡：早起、睡前、今日专注等行为记录。
- 未来计划：长期目标日期倒计时，到目标日发送一次普通通知。
- 设置：主题、提醒、声音、震动、账户信息。
- 官网：品牌展示、功能截图、下载入口、FAQ。

## API 约定

真实后端接口统一走 `/api`。重点接口：

- `/api/auth/*`：注册、登录、退出、当前用户、密码修改。
- `/api/tasks` 和 `/api/todos`：待办主接口和兼容别名。
- `/api/collections`：待办集。
- `/api/potato/sessions` 和 `/api/sessions`：土豆专注记录和兼容别名。
- `/api/stats/*`：统计分析。
- `/api/checkins`：打卡。
- `/api/future-plans`：未来计划。
- `/api/public/app/*`：官网和下载信息。

待办计数字段统一为：

- `estimatedPotatoes`
- `completedPotatoes`

## 通知策略

`src/services/notificationService.ts` 管理通知权限、调度和取消：

- 待办倒计时：开始后调度结束提醒；暂停或结束时取消旧提醒；恢复后重新调度。
- 未来计划：创建计划后按目标日 09:00 调度一次普通通知；删除计划后取消。
- Web：使用浏览器 Notification API。
- App：使用 Capacitor Local Notifications。

当前没有实现 iOS Live Activity，因此“锁屏实时倒计时”和“灵动岛实时倒计时”不属于现有能力。后续要做这部分，需要新增原生 ActivityKit 层，并在真机上验证。

## 验证建议

开发改动后至少运行：

```bash
corepack pnpm build:app
```

官网改动后运行：

```bash
corepack pnpm build:landing
```

涉及移动端通知时，还需要在 Android 真机或 iOS 真机上确认权限弹窗、系统通知和后台行为。
