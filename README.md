# 土豆时钟 Potato Clock

土豆时钟是一个面向移动端和 Web 的专注管理应用。它把待办、计时、统计、打卡和未来计划放在同一套体验里，让用户可以先确定今天要做什么，再开始一段不打扰的专注，并在结束后自然沉淀记录。

## 产品预览与下载

- [在线产品预览与官网](https://clock.cinoo.xyz)：查看真实界面、主要功能和版本说明。
- [Android APK](https://clock.cinoo.xyz/downloads/tudou-clock.apk)：当前版本 `1.2.8`，可直接下载安装。
- [iOS 未签名 IPA](https://github.com/Cinnamo-roll/Cinta-PotatoClock/actions/workflows/build-ios-unsigned-ipa.yml)：打开最新一次成功运行，在页面底部下载 `tudou-clock-unsigned-ipa` Artifact；安装前需要自行签名。

正式安装包不提交到 Git 仓库。Android 由官网提供固定下载地址；iOS Artifact 有保留期限，过期后可在 Actions 页面手动重新运行构建。

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
- `mvn -s maven-settings.xml test` 通过，51 个测试成功

## 环境变量

生产环境以根目录 `.env.production.example` 为模板，复制为 `.env.production` 后填写真实值。不要提交 `.env.production`、数据库密码、JWT 密钥和正式安装包。

关键变量：

```env
MYSQL_DATABASE=clock
MYSQL_USER=clock_user
MYSQL_PASSWORD=<strong_password>
MYSQL_ROOT_PASSWORD=<strong_root_password>
JWT_SECRET=<at_least_32_chars_secret>
CORS_ALLOWED_ORIGINS=https://<CLOCK_DOMAIN>,capacitor://localhost,ionic://localhost,http://localhost,https://localhost
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

- Android：`1.2.8`（`versionCode 11`）
- iOS：`1.2.8`（`build 11`，未签名 IPA）
- 官网与公开下载信息：`1.2.8`（必要更新）
- 安装包文件名：`downloads/tudou-clock.apk`
- APK/IPA、签名文件、部署压缩包和生产环境变量均不提交 GitHub。

### 1.2.8 注册登录与移动端流畅度修复

- 注册成功后由后端在同一请求中直接签发登录令牌，不再依赖第二次登录请求；同时清理该用户名的失败计数，并统一用户名大小写匹配。
- Android 与 iOS 的透明状态栏加入主题顶部承接层，普通页面与顶部卡片保持同色；“我的”页面继续使用页面背景色，注册页安全区不再被页面间距覆盖。
- 移除全局逐帧触摸拦截和列表逐项位移动画，恢复 WebView 原生惯性滚动，减少长列表与统计图表滑动时的合成负担。
- 游客提示改为更短且完整显示的“演示内容仅供查看”；统计页右上角分享入口暂显示“待开发”。
- 公开版本继续标记为必要更新，旧版 App 必须完成更新后使用。

### 1.2.7 状态栏与官网视觉统一

- Android 与 iOS 统一改为沉浸式状态栏：页面背景延伸至系统栏下方，交互内容由原生安全区数据避让刘海、挖孔与灵动岛。
- 移除启动页、系统栏、通知图标、默认待办和打卡动效中的历史粉色默认值，统一使用土豆金与奶油底色；用户主动选择的粉色主题和颜色选项仍然保留。
- 官网减少大面积白底，重做手机界面预览的奶油、土豆金和叶绿配色，并增强区块层次。
- 公开版本标记为必要更新；旧版 App 不可关闭更新弹窗，完成更新后才能继续使用。

### 1.2.6 登录、游客预览与主题修复

- 登录和注册请求不再携带历史 JWT；即使旧账号数据已被清理，也会正常进入凭据校验流程。
- 游客预览恢复页面滚动、底部导航、待办集展开与查看；所有新增、编辑、删除操作仍保持只读拦截。
- 移除游客提示中的设置入口，修正登录/注册页互相跳转的排版，并提升“先预览全部功能”按钮的可读性。
- 首次进入统一使用“土豆金”主题；仅在用户明确保存其他主题色后持续使用其选择。

### 1.2.5 更新、预览与整体体验优化

- 新增原生 App 版本检查；Android 可从提示直接下载新版 APK，iOS 跳转项目官网。
- 为待办集补充删除入口，删除分组时保留集内待办并移至未分组。
- 未登录用户可只读预览首页、待办集、统计、未来、设置、个人页和专注页；演示数据来自同一套相互关联的待办、记录与日期种子。
- 默认主题改为更贴合产品的“土豆金”，增加叶绿色点缀，缩小 Android 自适应图标前景，并减少 WebView 滚动时的模糊重绘和冗余动画。

### 1.2.4 Android 启动与官网动画修复

- 修复 Android 启动背景把自适应图标作为位图加载导致 `MainActivity` 创建前直接闪退的问题。
- 修复官网桌面端手机卡片首次加载时旋转角度被浮动动画覆盖的问题。

### 1.2.3 Android 兼容性调整

- Android 冷启动不再为 idle 计时状态创建前台服务，避免部分系统在打开应用时直接终止进程。
- 项目官网固定为 `https://clock.cinoo.xyz`；作者个人 Website 为 `https://cinoo.xyz`。

### 1.2.1 体验修正

- 移除统计图表在移动端点按后出现的浏览器蓝色焦点框。
- 历史记录、记录操作和时间编辑改为独立关闭，关闭子弹窗不会再带走历史记录。
- 相同开始与结束时间不再按跨日 24 小时处理；iOS 时间输入保持在弹窗内容区内。
- 统一各业务页面标题栏背景，并修正手机官网步骤 01/03、02/04 的纵向对齐。
- 统一待办单次时长、习惯计划量和目标计划量为纯数字输入，并移除快捷打卡菜单三项内容的二次闪烁动画。
- 重写历史记录的时间段编辑流程：单弹窗状态机替代嵌套弹窗，小时/分钟选择器统一 iOS 与 Android 显示，并覆盖同日、跨午夜和相同时间校验。

## 部署

根目录已经提供生产部署所需文件：

- `docker-compose.prod.yml`：MySQL、Redis、后端和官网 Nginx。
- `frontend/nginx.conf`：官网静态资源、下载目录和 `/api` 反向代理。
- `Caddyfile.clock.example`：使用示例域名的 Caddy 配置模板。
- `DEPLOY_ALIYUN.md`：阿里云 Docker 多项目部署步骤。

部署流程简述：

1. 配置 DNS，将 `<CLOCK_DOMAIN>` 指向服务器公网 IP。
2. 在服务器准备 Docker、Docker Compose、Caddy 和外部 `proxy` 网络。
3. 克隆仓库，复制并填写 `.env.production`。
4. 将 APK/IPA 放入 `downloads/`。
5. 执行 `docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build`。
6. 配置 Caddy 并访问 `https://<CLOCK_DOMAIN>` 验证。

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

## Author

- Created by **CintaOvO**
- GitHub: https://github.com/Cinnamo-roll
- Website: https://cinoo.xyz
- Contact: D1391571546@outlook.com
- Original repository: https://github.com/Cinnamo-roll/Cinta-PotatoClock

## Attribution

本项目采用 [PolyForm Noncommercial License 1.0.0](LICENSE)。仅允许该协议定义的非商业用途，包括个人学习、研究、实验及符合条件的非商业组织使用；任何商业用途均需事先取得作者的单独授权。分发本项目或其衍生版本时，必须同时提供许可证条款并保留适用的版权和署名声明。

项目来源和原始作者信息另见 [NOTICE](NOTICE)。第三方依赖仍分别适用其自身的许可证与声明。
