# 土豆时钟后端

`backend/` 是土豆时钟的 API 服务，负责认证、待办、待办集、专注记录、统计、打卡、未来计划、设置、设备信息和官网公开下载信息。

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 语言 | Java 21 |
| 框架 | Spring Boot 3.3.5 |
| Web | Spring Web, Validation |
| 安全 | Spring Security, JWT |
| 数据访问 | Spring Data JPA |
| 数据库 | MySQL 8 |
| 缓存 | Redis |
| 迁移 | Flyway |
| 文档 | springdoc-openapi |
| 构建 | Maven |
| 辅助 | Lombok, Actuator |

## 目录结构

```text
backend/
├── src/main/java/com/cinoo/clock/
│   ├── app/             # 官网公开信息、版本和下载接口
│   ├── auth/            # 注册、登录、退出、密码修改
│   ├── checkin/         # 打卡记录
│   ├── collection/      # 待办集
│   ├── common/          # 通用响应、异常、枚举
│   ├── config/          # Security、Redis、OpenAPI、JWT 配置
│   ├── device/          # 设备注册和通知偏好
│   ├── futureplan/      # 未来计划
│   ├── potato/          # 专注记录，技术命名统一为 potato
│   ├── security/        # JWT 过滤器、用户上下文、黑名单
│   ├── settings/        # 用户设置
│   ├── stats/           # 统计聚合
│   ├── task/            # 待办
│   └── user/            # 用户资料
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   └── db/migration/
├── Dockerfile
├── docker-compose.yml
├── maven-settings.xml
└── pom.xml
```

## 本地运行

环境要求：

- Java 21
- Maven
- MySQL 8
- Redis

运行测试：

```bash
mvn -s maven-settings.xml test
```

启动服务：

```bash
mvn -s maven-settings.xml spring-boot:run
```

打包：

```bash
mvn -s maven-settings.xml package
```

## 环境变量

| 变量 | 示例 | 说明 |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | `prod` | 运行环境 |
| `SERVER_PORT` | `8080` | 服务端口 |
| `DB_HOST` | `mysql` | MySQL 主机 |
| `DB_PORT` | `3306` | MySQL 端口 |
| `DB_NAME` | `potato_clock` | 数据库名 |
| `DB_USERNAME` | `potato_clock` | 数据库用户 |
| `DB_PASSWORD` | `<strong_password>` | 数据库密码 |
| `REDIS_HOST` | `redis` | Redis 主机 |
| `REDIS_PORT` | `6379` | Redis 端口 |
| `REDIS_PASSWORD` | `<optional_password>` | Redis 密码，可为空 |
| `JWT_SECRET` | `<at_least_32_chars_secret>` | JWT 密钥 |
| `JWT_EXPIRATION` | `604800000` | Token 有效期，毫秒 |
| `CORS_ALLOWED_ORIGINS` | `https://clock.cinoo.xyz,...` | 允许跨域来源 |
| `APP_ANDROID_APK_URL` | `https://clock.cinoo.xyz/downloads/tudou-clock.apk` | APK 下载地址 |
| `APP_IOS_IPA_URL` | `https://clock.cinoo.xyz/downloads/tudou-clock.ipa` | IPA 下载地址 |
| `APP_VERSION` | `1.2.0` | 官网公开版本号 |

不要把真实密码、JWT 密钥和服务器敏感信息提交到仓库。

## 响应格式

成功响应：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

错误响应会使用非 0 `code` 和可读 `message`。前端默认按这个结构解包。

## API 总览

认证与用户：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/api/auth/register` | 注册 |
| `POST` | `/api/auth/login` | 登录 |
| `POST` | `/api/auth/logout` | 退出 |
| `GET` | `/api/auth/me` | 当前用户 |
| `PUT` | `/api/auth/password` | 修改密码 |
| `GET` | `/api/users/me` | 用户资料 |
| `PUT` | `/api/users/me` | 更新资料 |

待办与待办集：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/tasks` | 待办列表 |
| `POST` | `/api/tasks` | 创建待办 |
| `GET` | `/api/tasks/{id}` | 待办详情 |
| `PUT` | `/api/tasks/{id}` | 更新待办 |
| `PATCH` | `/api/tasks/{id}/status` | 更新状态 |
| `PATCH` | `/api/tasks/{id}/select` | 选择待办 |
| `PATCH` | `/api/tasks/{id}/sort` | 更新排序 |
| `DELETE` | `/api/tasks/{id}` | 删除待办 |
| `GET` | `/api/todos` | 待办兼容别名 |
| `GET` | `/api/collections` | 待办集列表 |
| `POST` | `/api/collections` | 创建待办集 |
| `PUT` | `/api/collections/{id}` | 更新待办集 |
| `DELETE` | `/api/collections/{id}` | 删除待办集 |

专注记录：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/api/potato/sessions` | 创建记录 |
| `GET` | `/api/potato/sessions` | 查询记录 |
| `GET` | `/api/potato/sessions/today` | 今日记录 |
| `GET` | `/api/potato/sessions/recent` | 最近记录 |
| `PATCH` | `/api/potato/sessions/{id}` | 修改记录 |
| `DELETE` | `/api/potato/sessions/{id}` | 删除记录 |
| `GET` | `/api/sessions` | 简短别名 |
| `POST` | `/api/sessions` | 简短别名 |

统计、打卡、未来计划和设置：

| 模块 | 主要路径 |
| --- | --- |
| 统计 | `/api/stats/today`, `/api/stats/week`, `/api/stats/month`, `/api/stats/year`, `/api/stats/summary`, `/api/stats/calendar` |
| 打卡 | `/api/checkins` |
| 未来计划 | `/api/future-plans` |
| 设置 | `/api/settings` |
| 设备 | `/api/devices/register`, `/api/devices/current` |
| 公开下载信息 | `/api/public/app/info`, `/api/public/app/releases/latest`, `/api/public/app/downloads` |

## 数据模型与命名约定

产品对用户展示为“土豆时钟”。专注记录的技术命名统一为 `potato`，用于避免历史命名混乱：

- Java 包：`com.cinoo.clock.potato`
- 实体：`PotatoSession`
- Repository：`PotatoSessionRepository`
- Service：`PotatoSessionService`
- 表名：`potato_sessions`
- 任务字段：`estimated_potatoes`、`completed_potatoes`

`/api/sessions` 是简短别名，保留给前端历史记录等通用场景。

## 数据迁移

Flyway 脚本位于 `src/main/resources/db/migration`。

注意事项：

- 新环境从 `V1__init_schema.sql` 开始执行。
- 已在生产执行过的迁移不要直接修改。
- 如果迁移失败，先检查 `flyway_schema_history`，确认失败版本和错误信息后再处理。
- 新增字段时优先写兼容式迁移，避免影响已有数据。

## 测试

当前测试覆盖认证、打卡、设备、设置、专注记录、统计和任务服务。

运行：

```bash
mvn -s maven-settings.xml test
```

最近一次验证结果：43 个测试通过。
