# 土豆时钟阿里云 Docker 部署指南

本指南适用于将土豆时钟部署到阿里云 ECS，并使用 Caddy 提供 HTTPS 访问。默认方案由 Docker Compose 管理官网、后端、MySQL 和 Redis，适合首次部署；文末另附低内存服务器的更新建议。

以下命令中的 `<...>` 表示需要按实际环境填写的内容，例如服务器地址、域名和安装目录。建议使用独立子域名，并将项目放在 `/opt/potato-clock`。

## 1. 部署前准备

需要准备：

- 一台安装了 64 位 Linux 的阿里云 ECS；
- 一个已备案并可管理 DNS 的域名；
- Docker Engine、Docker Compose Plugin、Git、curl 和 openssl；
- 可通过 SSH 登录且具有 `sudo` 权限的用户。

本文使用以下变量：

```text
<SERVER_IP>      ECS 公网 IP
<SERVER_USER>    SSH 用户，例如 root 或 ubuntu
<CLOCK_DOMAIN>   土豆时钟使用的完整域名，例如 clock.example.com
<PROJECT_DIR>    项目目录，建议 /opt/potato-clock
<CADDY_DIR>      Caddy 配置目录，例如 /opt/caddy
```

在阿里云安全组中放行：

```text
22/tcp    SSH，建议只允许可信 IP
80/tcp    HTTP，用于跳转 HTTPS 和签发证书
443/tcp   HTTPS
```

MySQL `3306`、Redis `6379` 和后端 `8080` 不需要对公网开放。

## 2. 配置域名解析

在域名控制台添加 A 记录，将 `<CLOCK_DOMAIN>` 指向 `<SERVER_IP>`。解析生效后可在本地验证：

```bash
nslookup <CLOCK_DOMAIN>
```

返回 ECS 公网 IP 后再继续部署，否则 Caddy 无法正常申请 HTTPS 证书。

## 3. 登录并检查 Docker

```bash
ssh <SERVER_USER>@<SERVER_IP>
sudo docker version
sudo docker compose version
```

如果尚未安装 Docker，请先按照 [Docker 官方文档](https://docs.docker.com/engine/install/) 完成安装，并确保当前用户可以使用 `sudo docker`。

创建供 Caddy 和土豆时钟通信的外部网络：

```bash
sudo docker network inspect proxy >/dev/null 2>&1 || sudo docker network create proxy
```

Caddy 容器也必须加入 `proxy` 网络。假设容器名称为 `caddy`：

```bash
sudo docker network connect proxy caddy 2>/dev/null || true
```

## 4. 获取项目代码

```bash
sudo mkdir -p <PROJECT_DIR>
sudo chown -R "$USER":"$USER" <PROJECT_DIR>
git clone https://github.com/Cinnamo-roll/Cinta-PotatoClock.git <PROJECT_DIR>
cd <PROJECT_DIR>
```

如果目录中已有项目，更新代码即可：

```bash
cd <PROJECT_DIR>
git pull --ff-only
```

部署会使用这些文件：

```text
docker-compose.prod.yml
.env.production.example
Caddyfile.clock.example
frontend/nginx.conf
```

## 5. 配置生产环境变量

复制示例配置：

```bash
cd <PROJECT_DIR>
cp .env.production.example .env.production
nano .env.production
```

至少需要修改以下内容：

```env
MYSQL_PASSWORD=<强数据库密码>
MYSQL_ROOT_PASSWORD=<强数据库 root 密码>
JWT_SECRET=<随机密钥>

CORS_ALLOWED_ORIGINS=https://<CLOCK_DOMAIN>,capacitor://localhost,ionic://localhost,http://localhost,https://localhost
APP_OFFICIAL_SITE=https://<CLOCK_DOMAIN>
APP_PRIVACY_URL=https://<CLOCK_DOMAIN>/privacy
APP_ANDROID_APK_URL=https://<CLOCK_DOMAIN>/downloads/tudou-clock.apk
APP_IOS_IPA_URL=https://<CLOCK_DOMAIN>/downloads/tudou-clock.ipa
```

可以使用下面的命令生成 JWT 密钥：

```bash
openssl rand -base64 48
```

`.env.production` 包含密码和密钥，已被 Git 忽略。不要将它复制到聊天记录、截图或代码提交中。

## 6. 放置 Android 和 iOS 安装包

安装包通过官网的 `/downloads/` 路径提供，不需要提交到 Git 仓库。

先在服务器创建目录：

```bash
cd <PROJECT_DIR>
mkdir -p downloads
```

再从本地上传：

```bash
scp ./tudou-clock.apk <SERVER_USER>@<SERVER_IP>:<PROJECT_DIR>/downloads/tudou-clock.apk
scp ./tudou-clock.ipa <SERVER_USER>@<SERVER_IP>:<PROJECT_DIR>/downloads/tudou-clock.ipa
```

暂时没有某个平台的安装包时，可以先部署网站，并在 `.env.production` 中将对应的 `APP_ANDROID_AVAILABLE` 或 `APP_IOS_AVAILABLE` 设为 `false`。

## 7. 启动服务

首次部署需要构建镜像：

```bash
cd <PROJECT_DIR>
sudo docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

查看容器状态：

```bash
sudo docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

正常情况下，以下四个容器应处于运行状态：

```text
potato-clock-nginx
potato-clock-backend
potato-clock-mysql
potato-clock-redis
```

检查后端健康状态：

```bash
sudo docker exec potato-clock-nginx wget -qO- http://backend:8080/actuator/health
```

期望返回：

```json
{"status":"UP"}
```

## 8. 配置 Caddy 和 HTTPS

在 `<CADDY_DIR>/Caddyfile` 中加入：

```caddyfile
<CLOCK_DOMAIN> {
    encode gzip
    reverse_proxy clock-potato-clock:80
}
```

检查配置并重新加载 Caddy：

```bash
sudo docker exec caddy caddy validate --config /etc/caddy/Caddyfile
sudo docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

如果 Caddy 容器名称不是 `caddy`，请将命令中的容器名称替换为实际名称。重新加载失败时查看日志：

```bash
cd <CADDY_DIR>
sudo docker compose logs --tail=120
```

## 9. 上线验证

```bash
curl -I https://<CLOCK_DOMAIN>
curl https://<CLOCK_DOMAIN>/api/public/app/info
curl -I https://<CLOCK_DOMAIN>/downloads/tudou-clock.apk
curl -I https://<CLOCK_DOMAIN>/downloads/tudou-clock.ipa
```

检查结果：

- 官网返回 `200`；
- `/api/public/app/info` 返回 `code: 0`；
- 已上传的安装包返回 `200`，且 `Content-Length` 与本地文件大小一致；
- 浏览器访问官网时证书有效，页面和下载按钮均可正常使用。

如需进一步核对安装包，可比较 SHA-256：

```bash
sha256sum downloads/tudou-clock.apk downloads/tudou-clock.ipa
```

## 10. 日常更新

服务器资源充足时，可以直接拉取代码并重建：

```bash
cd <PROJECT_DIR>
git pull --ff-only
sudo docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

更新完成后再次执行第 9 节的验证命令。

如果只更换 APK 或 IPA，直接覆盖 `downloads` 中的同名文件即可，不需要重启容器：

```bash
scp ./tudou-clock.apk <SERVER_USER>@<SERVER_IP>:<PROJECT_DIR>/downloads/tudou-clock.apk
scp ./tudou-clock.ipa <SERVER_USER>@<SERVER_IP>:<PROJECT_DIR>/downloads/tudou-clock.ipa
```

### 低内存服务器

内存低于 2 GB 时，不建议在服务器上执行 Maven、Node.js 或 Docker 镜像构建。更稳妥的方式是在开发机完成构建：

```bash
cd backend
mvn -s maven-settings.xml -DskipTests package

cd ../frontend
corepack pnpm install --frozen-lockfile
corepack pnpm build:landing
```

然后将产物整理为：

```text
deploy/backend/app.jar
deploy/frontend/
```

上传产物后使用 `docker-compose.runtime.yml` 启动已有基础镜像：

```bash
cd <PROJECT_DIR>
sudo docker compose --env-file .env.production -f docker-compose.runtime.yml up -d --no-build --no-deps --force-recreate backend frontend
```

运行时配置固定使用土豆时钟独立的 `potato-clock-mysql`、`potato-clock-redis` 和 `potato-clock-internal` 网络，不与 MatchMate 共用数据库或 Redis。后端限制为 640 MiB 内存、1 GiB 含交换空间、0.75 CPU 和 256 个进程；MatchMate 容器可保持停止且 `restart=no`。

## 11. 备份与回滚

更新前至少备份环境变量和数据库：

```bash
cd <PROJECT_DIR>
cp .env.production ".env.production.backup.$(date +%Y%m%d-%H%M%S)"
sudo docker exec potato-clock-mysql sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --databases "$MYSQL_DATABASE"' > "potato-clock.$(date +%Y%m%d-%H%M%S).sql"
```

代码更新异常时，可切回上一提交并重新构建：

```bash
cd <PROJECT_DIR>
git log --oneline -5
git switch --detach <PREVIOUS_COMMIT>
sudo docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

确认恢复正常后，再决定是否回到主分支。数据库迁移已经执行但需要回退时，不要直接删除数据卷，应先核对迁移记录和备份。

## 12. 常见问题

### 官网返回 502

先检查前后端容器和日志：

```bash
cd <PROJECT_DIR>
sudo docker compose --env-file .env.production -f docker-compose.prod.yml ps
sudo docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=200 backend frontend
```

### Caddy 无法连接前端

确认两个容器都加入了 `proxy` 网络：

```bash
sudo docker network inspect proxy
```

### Docker 提示 permission denied

使用 `sudo docker ...` 执行命令，或按照 Docker 官方说明配置当前用户权限。生产服务器上不要直接放宽 `/var/run/docker.sock` 权限。

### 安装包下载返回 404

确认文件名和挂载目录：

```bash
ls -lh <PROJECT_DIR>/downloads
sudo docker exec potato-clock-nginx ls -lh /usr/share/nginx/html/downloads
```

文件名应为 `tudou-clock.apk` 和 `tudou-clock.ipa`。

## 上线检查清单

```text
[ ] DNS 已解析到 ECS
[ ] 安全组只开放必要端口
[ ] .env.production 已替换密码、JWT 密钥和域名
[ ] MySQL、Redis、后端端口未暴露到公网
[ ] 四个容器均正常运行
[ ] 后端健康检查返回 UP
[ ] Caddy 配置校验与重载成功
[ ] 官网和公开 API 返回 200
[ ] APK、IPA 的状态码、大小和 SHA-256 已核对
[ ] 数据库与生产配置已有备份
```
