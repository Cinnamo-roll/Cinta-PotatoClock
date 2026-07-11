# 土豆时钟前端

`frontend/` 是土豆时钟的前端工程，包含移动端 App、官网页面和 Capacitor 原生壳。App 面向日常使用，官网面向上线分发和产品介绍。

## 职责范围

- 提供移动端优先的待办、计时、统计、打卡、未来计划和设置页面。
- 提供官网首页、功能截图、FAQ 和安装包下载入口。
- 通过 Capacitor 同步到 Android / iOS 工程。
- 统一处理 mock 数据、真实 API、认证状态、偏好设置和移动端提醒。

## 产品预览

- [在线产品预览与官网](https://clock.cinoo.xyz)
- [Android APK](https://clock.cinoo.xyz/downloads/tudou-clock.apk)
- [iOS 未签名 IPA 构建](https://github.com/Cinnamo-roll/PotatoClock/actions/workflows/build-ios-unsigned-ipa.yml)：进入最新成功运行，在 Artifacts 区域下载 `tudou-clock-unsigned-ipa`。

iOS 构建产物是未签名 IPA，不能直接通过 App Store 安装；需要使用 AltStore、SideStore、TrollStore 或自己的开发者签名方式。Actions Artifact 默认有保留期限，过期后重新运行工作流即可生成。

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 基础 | React 19, TypeScript, Vite 7 |
| 路由 | React Router 7 |
| 数据请求 | TanStack Query, Axios |
| 状态管理 | Zustand |
| UI | Tailwind CSS, Radix UI, lucide-react, motion, sonner |
| 图表与动效 | Recharts, canvas-confetti |
| 移动端 | Capacitor 8, Android, iOS, Local Notifications, Haptics, Preferences |

## 目录结构

```text
frontend/
├── android/              # Capacitor Android 工程
├── ios/                  # Capacitor iOS 工程
├── src/
│   ├── api/              # API 封装和 mock/真实接口切换
│   ├── components/       # 通用组件、业务组件、官网组件
│   ├── hooks/            # TanStack Query hooks
│   ├── lib/              # Capacitor 环境判断等基础能力
│   ├── mocks/            # mock 数据和 mock client
│   ├── pages/            # App 页面与官网页面
│   ├── router/           # 路由配置
│   ├── services/         # 通知、声音、震动、打卡、存储、生命周期
│   ├── stores/           # auth/settings/timer/ui 等状态
│   ├── theme/            # 主题应用与主题配置
│   ├── types/            # TypeScript 类型
│   └── utils/            # 格式化、统计和工具函数
├── capacitor.config.ts   # Capacitor 配置
├── Dockerfile            # 官网生产镜像
├── nginx.conf            # 官网静态服务与 /api 反代
└── package.json
```

## 环境变量

| 变量 | 示例 | 说明 |
| --- | --- | --- |
| `VITE_APP_TARGET` | `app` / `landing` | 构建 App 或官网 |
| `VITE_API_BASE_URL` | `/api` | 后端 API 基础路径 |
| `VITE_USE_MOCK` | `false` | 是否启用 mock |
| `VITE_ANDROID_DOWNLOAD_URL` | `/downloads/tudou-clock.apk` | 官网 APK 下载地址 |
| `VITE_IOS_DOWNLOAD_URL` | `/downloads/tudou-clock.ipa` | 官网 IPA 下载地址 |

开发时可以在 `frontend/.env.example` 的基础上创建本地环境变量文件。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `corepack pnpm install` | 安装依赖 |
| `corepack pnpm dev:app` | 启动 App 开发模式 |
| `corepack pnpm dev:landing` | 启动官网开发模式 |
| `corepack pnpm build:app` | 构建 App Web 产物 |
| `corepack pnpm build:landing` | 构建官网 |
| `corepack pnpm preview` | 预览构建产物 |
| `corepack pnpm cap:sync` | 构建 App 并同步 Capacitor |
| `corepack pnpm cap:android` | 同步并打开 Android Studio |
| `corepack pnpm cap:ios` | 同步并打开 Xcode |

## 应用模块

- 首页：待办列表、快速开始、创建，以及通过上下按钮可靠调整顺序。
- 专注页：倒计时、正计时、不计时、暂停、继续、完成和放弃。
- 统计页：概览、趋势、热力图、任务排行、最近记录和成就。
- 打卡：早起、今日专注、睡前记录，以及历史编辑。
- 未来计划：目标日期倒计时，到目标日触发一次提醒。
- 设置与个人页：主题、提醒、账户资料、密码修改、官网与反馈入口。
- 官网：品牌展示、功能截图、下载入口、上线 FAQ。
- 我的：资料、密码、主题与退出登录确认，避免误触退出。

## API 约定

真实接口统一走 `VITE_API_BASE_URL`。生产环境中 Nginx 将 `/api` 转发到后端服务。

重点接口：

- `/api/auth/*`
- `/api/users/me`
- `/api/tasks` 和 `/api/todos`
- `/api/collections`
- `/api/potato/sessions` 和 `/api/sessions`
- `/api/stats/*`
- `/api/checkins`
- `/api/future-plans`
- `/api/settings`
- `/api/public/app/*`

专注记录相关类型命名为 `PotatoSession`，任务计数字段为 `estimatedPotatoes` 和 `completedPotatoes`。这属于前后端契约，修改时需要同时更新后端 DTO、数据库迁移和 mock 数据。

## 通知策略

`src/services/notificationService.ts` 统一管理通知：

- 倒计时开始后调度结束提醒。
- 暂停或完成时取消当前提醒。
- 恢复计时时重新调度。
- 未来计划创建后按目标日 09:00 调度一次普通提醒，删除后取消。
- Web 环境使用浏览器 Notification API。
- App 环境使用 Capacitor Local Notifications。
- Android 专注计时使用前台服务同步通知栏与锁屏状态。
- iOS 16.1+ 专注计时使用 ActivityKit 实时活动，并在支持机型显示灵动岛。

未来计划只在目标日期发送普通通知，不会常驻锁屏或灵动岛。涉及系统计时展示与通知的改动必须在真机验证。

## 发布版本

- Android `versionName`：`1.2.1`
- Android `versionCode`：`4`
- iOS `MARKETING_VERSION`：`1.2.1`，`CURRENT_PROJECT_VERSION`：`4`
- 公开版本：`1.2.1`
- iOS：由 GitHub Actions 生成 `tudou-clock-unsigned-ipa` Artifact。
- 正式 APK、IPA、签名文件和 `dist/` 构建产物不提交 GitHub。

本版移动端回归重点：Recharts 图表点按不显示系统焦点框；历史记录的记录操作层与时间编辑层独立关闭；相同起止时间校验为无效；标题栏不再按右侧操作区叠加异色背景；手机官网工作流两列分别对齐；待办时长与计划量统一使用纯数字键盘和数字过滤；快捷打卡菜单只保留容器级展开动画，三项内容不再二次闪烁。

历史记录编辑器使用单个 Radix Dialog 与内部状态机切换“日历、记录操作、时间编辑、删除确认”，不再嵌套弹窗。专注时间采用小时/分钟原生选择器组合，避免 iOS 与 Android WebView 对 `input[type=time]` 的尺寸、键盘和关闭事件差异；结束时刻早于开始时刻时明确按次日计算，相同时刻禁止保存。

## UI 文案原则

- 品牌名保留在登录页、官网、Logo、文档和必要的关于页面。
- 普通操作提示使用“专注完成”“计划到点”“资料已更新”等自然表达。
- 避免在通知、toast、按钮里重复堆叠品牌词，减少对用户正常使用的干扰。

## 验证建议

前端体验改动：

```bash
corepack pnpm build:app
```

官网改动：

```bash
corepack pnpm build:landing
```

移动端能力改动：

- Android 真机检查通知权限、后台提醒、震动反馈。
- iOS 真机检查通知权限、锁屏普通通知和系统设置。
