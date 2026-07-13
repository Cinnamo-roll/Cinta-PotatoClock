# 土豆时钟后端

`backend/` 是土豆时钟的 Spring Boot API 服务，负责认证、待办、专注记录、统计、打卡、未来计划、用户设置和公开版本信息。

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 运行环境 | Java 21 |
| 框架 | Spring Boot 3.3.5 |
| 安全 | Spring Security, JWT |
| 数据访问 | Spring Data JPA |
| 数据库 | MySQL 8 |
| 缓存 | Redis |
| 数据迁移 | Flyway |
| API 文档 | springdoc-openapi |
| 构建 | Maven |

## 本地运行

需要 Java 21、MySQL 8 和 Redis。默认开发配置会连接本机 `3306` 和 `6379` 端口，变量名称可参考 [`.env.example`](.env.example)。

```bash
# 运行测试
mvn -s maven-settings.xml test

# 启动开发服务
mvn -s maven-settings.xml spring-boot:run

# 构建可执行 JAR
mvn -s maven-settings.xml package
```

服务默认监听 `http://localhost:8080`。

## 环境变量

| 变量 | 默认值或示例 | 说明 |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | `dev` | Spring 运行环境 |
| `SERVER_PORT` | `8080` | 服务端口 |
| `MYSQL_HOST` | `localhost` | MySQL 主机 |
| `MYSQL_PORT` | `3306` | MySQL 端口 |
| `MYSQL_DATABASE` | `clock` | 数据库名 |
| `MYSQL_USER` | `clock_user` | 数据库用户 |
| `MYSQL_PASSWORD` | `<strong_password>` | 数据库密码 |
| `REDIS_HOST` | `localhost` | Redis 主机 |
| `REDIS_PORT` | `6379` | Redis 端口 |
| `REDIS_PASSWORD` | 空 | Redis 密码 |
| `JWT_SECRET` | `<at_least_32_chars>` | JWT 签名密钥 |
| `JWT_EXPIRES_IN` | `86400` | Token 有效期，秒 |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,...` | 允许的跨域来源 |
| `APP_VERSION` | 由发布环境设置 | 公开版本号 |
| `APP_BUILD_NUMBER` | 由发布环境设置 | 原生构建号 |
| `APP_FORCE_UPDATE` | `false` / `true` | 是否要求客户端强制更新 |
| `APP_ANDROID_APK_URL` | 完整 HTTPS 地址 | Android 下载地址 |
| `APP_IOS_IPA_URL` | 完整 HTTPS 地址 | iOS 下载地址 |

生产环境请从根目录 [`.env.production.example`](../.env.production.example) 创建独立配置，不要提交真实密码和密钥。

## API

所有业务响应使用统一结构：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

主要接口分组：

| 模块 | 路径 |
| --- | --- |
| 认证 | `/api/auth/*` |
| 用户 | `/api/users/*` |
| 待办 | `/api/tasks/*`，兼容别名 `/api/todos/*` |
| 待办集 | `/api/collections/*` |
| 专注记录 | `/api/potato/sessions/*`，兼容别名 `/api/sessions/*` |
| 统计 | `/api/stats/*` |
| 打卡 | `/api/checkins/*` |
| 未来计划 | `/api/future-plans/*` |
| 设置 | `/api/settings` |
| 设备 | `/api/devices/*` |
| 公开应用信息 | `/api/public/app/*` |

开发环境启动后可以访问：

- Swagger UI：`http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON：`http://localhost:8080/v3/api-docs`
- 健康检查：`http://localhost:8080/actuator/health`

## 目录结构

```text
backend/
├── src/main/java/com/cinoo/clock/
│   ├── app/             # 公开应用与下载信息
│   ├── auth/            # 注册、登录与认证
│   ├── checkin/         # 打卡
│   ├── collection/      # 待办集
│   ├── common/          # 通用响应、异常和枚举
│   ├── config/          # 安全、Redis、OpenAPI
│   ├── device/          # 设备信息
│   ├── futureplan/      # 未来计划
│   ├── potato/          # 专注记录
│   ├── security/        # JWT 过滤与用户上下文
│   ├── settings/        # 用户设置
│   ├── stats/           # 统计聚合
│   ├── task/            # 待办
│   └── user/            # 用户资料
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/
├── Dockerfile
├── maven-settings.xml
└── pom.xml
```

## 数据迁移

Flyway 脚本位于 `src/main/resources/db/migration`。

- 已经在生产环境执行的迁移不要直接修改。
- 新增结构变更时创建新的迁移文件。
- 迁移失败时先检查 `flyway_schema_history` 和后端日志。
- 数据库回滚前先完成备份，不要直接删除生产数据卷。

## 验证

```bash
mvn -s maven-settings.xml test
```

涉及迁移或生产配置时，还应启动真实服务并检查 `/actuator/health` 与 `/api/public/app/info`。

本目录中的项目代码遵循仓库根目录的 [PolyForm Noncommercial License 1.0.0](../LICENSE)。
