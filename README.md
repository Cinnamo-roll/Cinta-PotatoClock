# 土豆时钟 Potato Clock

土豆时钟是一个面向移动端和 Web 的专注管理应用，核心体验围绕待办、待办集、土豆专注计时、专注历史、统计分析、早起/睡前打卡、未来计划和本地提醒展开。项目采用前后端分离结构：`frontend/` 提供官网、移动端 Web App 与 Capacitor App 壳，`backend/` 提供 Spring Boot REST API、认证、数据持久化和上线运行能力。

## 当前状态

- 前端 App 和官网已经支持独立构建：`build:app` 用于移动端应用，`build:landing` 用于官网。
- 后端接口统一使用 `{"code":0,"message":"success","data":...}` 响应结构。
- 专注记录相关命名统一为 `potato`：接口为 `/api/potato/sessions`，数据库表为 `potato_sessions`，任务字段为 `estimatedPotatoes` / `completedPotatoes`。
- App 端使用 Capacitor Local Notifications 做本地提醒：待办倒计时结束会通知，未来计划到目标日会发一次普通通知。
- 官网部署目标是 `clock.cinoo.xyz`，可展示产品介绍并提供 APK / IPA 下载入口。

## 技术栈

前端：

- React 19、TypeScript、Vite 7、React Router 7
- Zustand、TanStack Query、Axios
- Tailwind CSS、Radix Dialog/Tabs/Switch、lucide-react、motion、Recharts
- Capacitor 8：Android、iOS、本地通知、震动、网络状态、偏好存储、状态栏、启动屏

后端：

- Java 21、Spring Boot 3.3
- Spring Web、Spring Security、Spring Data JPA、Validation、Actuator
- MySQL 8、Redis、Flyway
- JWT、springdoc-openapi、Lombok
- Maven、本地 `maven-settings.xml`

部署：

- Docker Compose
- Nginx 前端静态站点和反向代理
- Caddy 负责服务器统一入口、HTTPS 和多项目域名分流

## 目录结构

```text
.
├── frontend/                 # React + Vite + Capacitor 前端
├── backend/                  # Spring Boot API 服务
├── downloads/                # 官网下载文件挂载目录，APK/IPA 不提交
├── docker-compose.prod.yml   # 生产环境编排示例
├── Caddyfile.clock.example   # clock.cinoo.xyz 的 Caddy 配置示例
├── .env.production.example   # 生产环境变量模板
├── DEPLOY_ALIYUN.md          # 阿里云 Docker 多项目部署指南
└── README.md                 # 项目总览
```

## 本地开发

准备环境：

- Node.js 20+，推荐使用 Corepack 管理 pnpm
- Java 21
- MySQL 8 和 Redis

前端：

```bash
cd frontend
corepack pnpm install
corepack pnpm dev:app
```

后端：

```bash
cd backend
mvn -s maven-settings.xml spring-boot:run
```

常用构建与验证：

```bash
cd frontend
corepack pnpm build:app
corepack pnpm build:landing

cd ../backend
mvn -s maven-settings.xml test
```

## 前后端联调

前端通过 `frontend/src/api/http.ts` 统一处理 API 请求。开发时可以使用 mock，也可以接真实后端：

- `VITE_USE_MOCK=true`：使用前端 mock 数据。
- `VITE_USE_MOCK=false`：请求后端 `/api`。
- `VITE_API_BASE_URL=/api`：生产环境由 Nginx 反代到后端容器。

后端默认允许本地 Vite、官网域名和 Capacitor 常见来源，配置项为 `CORS_ALLOWED_ORIGINS`。

## 核心功能

- 待办管理：普通待办、习惯、长期目标、待办集、排序、完成状态。
- 土豆专注：倒计时、正计时、手动完成、暂停、放弃原因、专注记录。
- 统计分析：今日、周、月、年、日历、打断原因、时段分布、待办维度统计。
- 打卡：早起、睡前、今日专注等记录，支持笔记和统计图表。
- 未来计划：目标日期倒计时，到点发送普通本地通知。
- 设置和账户：主题、声音、震动、通知偏好、用户信息和密码。
- 官网：产品介绍、功能截图、下载入口、FAQ 和部署下载路径。

## 通知能力说明

当前 App 端依赖 Capacitor Local Notifications：

- 待办倒计时结束：发送本地通知，标题为“土豆专注完成”，正文包含待办标题。
- 未来计划到点：在目标日 09:00 发送一次普通本地通知。
- 网页端：浏览器支持 Notification API 时使用普通网页通知。

当前实现不包含 iOS ActivityKit，因此不能保证锁屏实时倒计时或灵动岛实时更新。要实现灵动岛/锁屏 Live Activity，需要后续新增 iOS 原生能力或可靠的 Capacitor 插件，并补充原生端调试。

## 部署入口

上线准备文件已经放在根目录：

- `docker-compose.prod.yml`：MySQL、Redis、后端、官网 Nginx。
- `.env.production.example`：生产变量模板，复制为 `.env.production` 后填写强密码和域名。
- `Caddyfile.clock.example`：挂到现有 Caddy 的站点配置示例。
- `downloads/README.md`：APK / IPA 文件命名与下载路径说明。
- `DEPLOY_ALIYUN.md`：从服务器准备到发布验证的完整步骤。

## 验证记录

最近一次本地验证：

- `corepack pnpm build:app`
- `mvn -s maven-settings.xml test`
