# 土豆时钟后端

这里是土豆时钟的 Spring Boot 后端服务，负责用户认证、待办、待办集、土豆专注记录、统计、打卡、未来计划、设置、设备信息和官网公开下载信息。

## 技术栈

- Java 21
- Spring Boot 3.3.5
- Spring Web、Spring Security、Spring Data JPA、Validation、Actuator
- MySQL 8、Redis、Flyway
- JWT：`jjwt`
- OpenAPI：`springdoc-openapi`
- Lombok
- Maven

## 目录结构

```text
backend/
├── src/main/java/com/cinoo/clock/
│   ├── app/             # 官网公开信息、版本和下载接口
│   ├── auth/            # 注册、登录、退出、密码修改
│   ├── checkin/         # 打卡记录
│   ├── collection/      # 待办集
│   ├── common/          # 通用响应、异常、工具
│   ├── device/          # 设备注册和通知偏好
│   ├── futureplan/      # 未来计划
│   ├── potato/          # 土豆专注记录
│   ├── security/        # JWT、认证过滤器、用户上下文
│   ├── settings/        # 用户设置
│   ├── stats/           # 统计分析
│   ├── task/            # 待办
│   └── user/            # 用户资料
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/    # Flyway 数据库迁移
├── docker-compose.yml   # 后端本地依赖/服务示例
├── Dockerfile
└── pom.xml
```

## 数据库命名

产品命名统一为土豆时钟，专注记录相关技术命名统一为 `potato`：

- 表名：`potato_sessions`
- 任务计数字段：`estimated_potatoes`、`completed_potatoes`
- Java 包：`com.cinoo.clock.potato`
- API：`/api/potato/sessions`

`/api/sessions` 仍作为简短别名保留，便于前端历史模块使用。

## 环境变量

常用配置：

```env
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080

DB_HOST=mysql
DB_PORT=3306
DB_NAME=potato_clock
DB_USERNAME=potato_clock
DB_PASSWORD=<strong_password>

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=<optional_password>

JWT_SECRET=<at_least_32_chars_secret>
JWT_EXPIRATION=604800000

CORS_ALLOWED_ORIGINS=https://clock.cinoo.xyz,capacitor://localhost,ionic://localhost,http://localhost,https://localhost

APP_DOWNLOAD_ANDROID_URL=https://clock.cinoo.xyz/downloads/potato-clock.apk
APP_DOWNLOAD_IOS_URL=https://clock.cinoo.xyz/downloads/potato-clock.ipa
APP_DOWNLOAD_VERSION=0.1.0
APP_DOWNLOAD_RELEASE_NOTES=土豆时钟初始上线版本
```

本地开发可以直接使用 `application.yml` 默认值，也可以通过环境变量覆盖。

## 常用命令

```bash
mvn -s maven-settings.xml test
mvn -s maven-settings.xml spring-boot:run
mvn -s maven-settings.xml package
```

Docker 构建：

```bash
docker build -t potato-clock-backend .
```

## API 总览

认证：

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PUT /api/auth/password`

用户：

- `GET /api/users/me`
- `PUT /api/users/me`

待办和待办集：

- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/{id}`
- `PUT /api/tasks/{id}`
- `PATCH /api/tasks/{id}/status`
- `PATCH /api/tasks/{id}/select`
- `PATCH /api/tasks/{id}/sort`
- `DELETE /api/tasks/{id}`
- `GET /api/todos`
- `POST /api/todos`
- `GET /api/collections`
- `POST /api/collections`
- `PUT /api/collections/{id}`
- `DELETE /api/collections/{id}`
- `PATCH /api/collections/{id}/sort`

土豆专注记录：

- `POST /api/potato/sessions`
- `GET /api/potato/sessions`
- `GET /api/potato/sessions/today`
- `GET /api/potato/sessions/recent`
- `PATCH /api/potato/sessions/{id}`
- `DELETE /api/potato/sessions/{id}`
- `GET /api/sessions`
- `POST /api/sessions`

统计：

- `GET /api/stats/today`
- `GET /api/stats/week`
- `GET /api/stats/month`
- `GET /api/stats/year`
- `GET /api/stats/summary`
- `GET /api/stats/distribution`
- `GET /api/stats/calendar`
- `GET /api/stats/week-summary`
- `GET /api/stats/interruption-reasons`
- `GET /api/stats/period-distribution`
- `GET /api/stats/tasks`
- `GET /api/stats/sessions/recent`

打卡：

- `POST /api/checkins`
- `GET /api/checkins`
- `PATCH /api/checkins/{id}`
- `DELETE /api/checkins/{id}`

未来计划和设置：

- `GET /api/future-plans`
- `POST /api/future-plans`
- `PUT /api/future-plans/{id}`
- `DELETE /api/future-plans/{id}`
- `GET /api/settings`
- `PUT /api/settings`

设备和公开信息：

- `POST /api/devices/register`
- `PUT /api/devices/current`
- `GET /api/devices/current`
- `DELETE /api/devices/current`
- `GET /api/public/app/info`
- `GET /api/public/app/releases/latest`
- `GET /api/public/app/downloads`

## 响应结构

成功响应：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

业务错误会返回非 0 `code` 和可读 `message`。前端默认按这个结构解包。

## 数据迁移

Flyway 脚本位于 `src/main/resources/db/migration`。上线前请确认：

- 新环境从 V1 开始执行。
- 生产库密码、JWT 密钥不提交到仓库。
- 如果迁移失败，需要先检查 `flyway_schema_history`，不要直接重复改已执行脚本。

## 验证记录

最近一次本地验证：

```bash
mvn -s maven-settings.xml test
```

结果：43 个测试通过。
