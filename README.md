# 土豆时钟 Potato Clock

土豆时钟是一个面向移动端和 Web 的专注管理应用。它把待办、计时、统计、打卡和未来计划放在同一套体验里，让用户可以先确定今天要做什么，再开始一段不打扰的专注，并在结束后自然沉淀记录。

本仓库采用前后端分离结构：

- `frontend/`：React + Vite + Capacitor，负责移动端 App、官网页面和安装包下载入口。
- `backend/`：Spring Boot，负责认证、业务接口、数据持久化、统计和公开下载信息。
- 根目录：生产部署编排、环境变量模板、Caddy 示例和阿里云部署说明。

## 功能概览

- 待办管理：普通待办、习惯、长期目标、待办集、明确的上下移动排序和状态流转。
- 专注计时：倒计时、正计时、不计时、暂停、继续、手动完成和放弃原因。
- 记录与统计：今日、周、月、年、热力图、趋势图、任务排行和打断原因。
- 打卡记录：早起、今日专注、睡前等日常记录。
- 未来计划：重要日期倒计时，并在目标日发送一次普通提醒。
- 移动端能力：Capacitor App、本地通知、Android 前台计时、iOS 实时活动、震动反馈、主题与偏好存储。
- 官网能力：品牌首页、功能截图、FAQ、APK/IPA 下载入口。

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | React 19, TypeScript, Vite 7, React Router 7 |
| 状态与请求 | Zustand, TanStack Query, Axios |
| UI | Tailwind CSS, Radix UI, lucide-react, motion, Recharts |
| 移动端 | Capacitor 8, Android, iOS, Local Notifications, Haptics |
| 后端 | Java 21, Spring Boot 3.3, Spring Security, Spring Data JPA |
| 数据 | MySQL 8, Redis, Flyway |
| 文档与部署 | OpenAPI, Docker Compose, Nginx, Caddy |

## 项目结构

```text
.
├── frontend/                 # 前端、官网、Capacitor App
├── backend/                  # Spring Boot API 服务
├── downloads/                # 安装包挂载目录，正式 APK/IPA 不提交
├── docker-compose.prod.yml   # 生产环境 Docker Compose
├── Caddyfile.clock.example   # Caddy 站点配置示例
├── .env.production.example   # 生产环境变量模板
├── DEPLOY_ALIYUN.md          # 阿里云部署说明
└── README.md                 # 项目总览
```

## 快速开始

环境要求：

- Node.js 20+
- Corepack / pnpm 10+
- Java 21
- MySQL 8
- Redis

前端启动：

```bash
cd frontend
corepack pnpm install
corepack pnpm dev:app
```

后端启动：

```bash
cd backend
mvn -s maven-settings.xml spring-boot:run
```

## 构建与测试

前端 App 构建：

```bash
cd frontend
corepack pnpm build:app
```

官网构建：

```bash
cd frontend
corepack pnpm build:landing
```

后端测试：

```bash
cd backend
mvn -s maven-settings.xml test
```

最近一次验证结果：

- `corepack pnpm build:app` 通过
- `corepack pnpm build:landing` 通过
- `mvn -s maven-settings.xml test` 通过，46 个测试成功

## 环境变量

生产环境以根目录 `.env.production.example` 为模板，复制为 `.env.production` 后填写真实值。不要提交 `.env.production`、数据库密码、JWT 密钥和正式安装包。

关键变量：

```env
MYSQL_DATABASE=potato_clock
MYSQL_USER=potato_clock
MYSQL_PASSWORD=<strong_password>
MYSQL_ROOT_PASSWORD=<strong_root_password>
JWT_SECRET=<at_least_32_chars_secret>
CORS_ALLOWED_ORIGINS=https://clock.cinoo.xyz,capacitor://localhost,ionic://localhost,http://localhost,https://localhost
VITE_APP_TARGET=landing
VITE_API_BASE_URL=/api
VITE_USE_MOCK=false
```

## 接口与命名约定

后端统一返回：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

专注记录的技术命名统一为 `potato`：

- API：`/api/potato/sessions`
- 兼容别名：`/api/sessions`
- 数据表：`potato_sessions`
- 前端类型：`PotatoSession`
- 任务计数字段：`estimatedPotatoes`、`completedPotatoes`

用户界面不刻意重复品牌名，普通操作提示以“专注完成”“未来计划到点”“资料已更新”等自然表达为主。

## 通知能力

当前通知与系统计时展示包括：

- 待办倒计时结束：发送普通本地通知，标题为“专注完成”，正文包含待办标题。
- 未来计划到点：目标日 09:00 发送一次普通本地通知。
- Web 环境：浏览器支持 Notification API 时使用普通网页通知。
- Android：专注进行中通过前台服务在通知栏和锁屏持续显示计时，结束后自动移除。
- iOS 16.1+：专注进行中通过 ActivityKit 显示锁屏实时活动；支持的机型同时显示灵动岛。

未来计划只在目标日期发送普通通知，不会长期占用锁屏或灵动岛。系统级计时展示仍需在 Android、iPhone 真机上验证权限与后台行为。

## 当前发布版本

- Android：`1.2`（`versionCode 3`）
- 官网与公开下载信息：`1.2.0`
- 安装包文件名：`downloads/tudou-clock.apk`
- APK/IPA、签名文件、部署压缩包和生产环境变量均不提交 GitHub。

## 部署

根目录已经提供生产部署所需文件：

- `docker-compose.prod.yml`：MySQL、Redis、后端和官网 Nginx。
- `frontend/nginx.conf`：官网静态资源、下载目录和 `/api` 反向代理。
- `Caddyfile.clock.example`：多项目服务器上的 `clock.cinoo.xyz` 配置示例。
- `DEPLOY_ALIYUN.md`：阿里云 Docker 多项目部署步骤。

部署流程简述：

1. 配置 DNS，将 `clock.cinoo.xyz` 指向服务器公网 IP。
2. 在服务器准备 Docker、Docker Compose、Caddy 和外部 `proxy` 网络。
3. 克隆仓库，复制并填写 `.env.production`。
4. 将 APK/IPA 放入 `downloads/`。
5. 执行 `docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build`。
6. 配置 Caddy 并访问 `https://clock.cinoo.xyz` 验证。

## 维护建议

- 修改前端体验后运行 `corepack pnpm build:app`。
- 修改官网后运行 `corepack pnpm build:landing`。
- 修改后端、数据库迁移或接口契约后运行 `mvn -s maven-settings.xml test`。
- 修改通知相关逻辑后，需要在 Android/iOS 真机验证权限弹窗、前后台通知和系统设置行为。
- 已执行过的 Flyway 迁移不要直接改动；生产库迁移失败时先检查 `flyway_schema_history`。

## 相关文档

- [前端说明](frontend/README.md)
- [后端说明](backend/README.md)
- [阿里云部署说明](DEPLOY_ALIYUN.md)
