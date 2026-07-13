# 土豆时钟 Potato Clock

[![Website](https://img.shields.io/badge/website-clock.cinoo.xyz-D7A52E?style=flat-square)](https://clock.cinoo.xyz)
[![iOS Build](https://github.com/Cinnamo-roll/Cinta-PotatoClock/actions/workflows/build-ios-unsigned-ipa.yml/badge.svg)](https://github.com/Cinnamo-roll/Cinta-PotatoClock/actions/workflows/build-ios-unsigned-ipa.yml)
[![License](https://img.shields.io/badge/license-PolyForm%20Noncommercial%201.0.0-6F7D3D?style=flat-square)](LICENSE)

土豆时钟是一款面向移动端和 Web 的专注管理应用，将待办、专注计时、统计、打卡和未来计划整合在同一套体验中。未登录时也可以浏览只读演示，登录后即可保存自己的任务与专注记录。

## 在线体验与下载

| 平台 | 入口 | 说明 |
| --- | --- | --- |
| Web | [clock.cinoo.xyz](https://clock.cinoo.xyz) | 官网与只读产品预览 |
| Android | [下载 APK](https://clock.cinoo.xyz/downloads/tudou-clock.apk) | 按系统提示安装 |
| iOS | [下载未签名 IPA](https://clock.cinoo.xyz/downloads/tudou-clock.ipa) | 需要自行签名后安装 |
| iOS CI | [GitHub Actions](https://github.com/Cinnamo-roll/Cinta-PotatoClock/actions/workflows/build-ios-unsigned-ipa.yml) | 下载最新的 `tudou-clock-unsigned-ipa` Artifact |

## 主要功能

- 待办与待办集：普通待办、习惯、长期目标、分组和排序。
- 专注计时：倒计时、正计时、不计时、暂停、继续和放弃原因。
- 数据统计：今日、周、月、年、热力图、趋势、任务排行和打断分析。
- 日常打卡：早起、今日专注、睡前记录及历史编辑。
- 未来计划：重要日期倒计时与到期提醒。
- 移动端体验：本地通知、Android 前台计时、iOS 实时活动、震动反馈和主题设置。
- 游客预览：无需登录即可浏览完整演示数据，所有写操作保持只读。

## 技术栈

| 模块 | 技术 |
| --- | --- |
| 前端 | React 19, TypeScript, Vite 7, React Router 7 |
| 状态与请求 | Zustand, TanStack Query, Axios |
| UI 与图表 | Tailwind CSS, Radix UI, motion, Recharts |
| 移动端 | Capacitor 8, Android, iOS |
| 后端 | Java 21, Spring Boot 3.3, Spring Security, Spring Data JPA |
| 数据 | MySQL 8, Redis, Flyway |
| 部署 | Docker Compose, Nginx, Caddy |

## 项目结构

```text
.
├── frontend/                 # Web、官网与 Capacitor App
├── backend/                  # Spring Boot API 服务
├── downloads/                # 服务器安装包挂载目录
├── docker-compose.prod.yml   # 标准生产部署
├── docker-compose.runtime.yml # 预构建产物部署
├── .env.production.example   # 生产环境变量模板
└── DEPLOY_ALIYUN.md          # 阿里云部署指南
```

## 本地开发

需要 Node.js 20+、pnpm 10+、Java 21、MySQL 8 和 Redis。

启动前端：

```bash
cd frontend
corepack pnpm install
corepack pnpm dev:app
```

启动后端：

```bash
cd backend
mvn -s maven-settings.xml spring-boot:run
```

前端环境变量参考 [`frontend/.env.example`](frontend/.env.example)，后端配置参考 [`backend/.env.example`](backend/.env.example)。生产部署请使用根目录 [`.env.production.example`](.env.production.example)，不要提交真实密码、JWT 密钥或签名文件。

## 构建与测试

```bash
# App Web 产物
cd frontend
corepack pnpm build:app

# 官网
corepack pnpm build:landing

# 后端测试
cd ../backend
mvn -s maven-settings.xml test
```

Android 与 iOS 原生构建方式见 [前端说明](frontend/README.md)。

## 部署

生产环境可以直接通过 `docker-compose.prod.yml` 构建，也可以在本地生成前后端产物后使用 `docker-compose.runtime.yml` 部署到低内存服务器。

完整步骤见 [阿里云 Docker 部署指南](DEPLOY_ALIYUN.md)。

## 文档

- [前端开发说明](frontend/README.md)
- [后端开发说明](backend/README.md)
- [阿里云部署指南](DEPLOY_ALIYUN.md)
- [安装包目录说明](downloads/README.md)

## 许可证

本项目采用 [PolyForm Noncommercial License 1.0.0](LICENSE)，仅允许该协议定义的非商业用途。商业使用需要事先取得作者的单独授权；第三方依赖继续适用各自的许可证。

## 作者

- **CintaOvO**
- GitHub: [@Cinnamo-roll](https://github.com/Cinnamo-roll)
- Website: [cinoo.xyz](https://cinoo.xyz)
- Contact: [D1391571546@outlook.com](mailto:D1391571546@outlook.com)

项目来源与版权声明见 [NOTICE](NOTICE)。
