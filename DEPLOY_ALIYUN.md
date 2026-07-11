# 土豆时钟阿里云 Docker 部署指南

这是一份可提交到公开仓库的部署文档。真实服务器 IP、现有项目域名、登录用户、私有路径等信息全部使用占位符表示，部署时请在本地或服务器上替换。

## 0. 占位符替换表

部署前先准备这些值：

```text
<SERVER_IP>              云服务器公网 IP
<ROOT_DOMAIN>            主域名，例如 example.com
<CLOCK_DOMAIN>           土豆时钟域名，例如 clock.example.com
<EXISTING_SITE_DOMAIN>   服务器上已有项目域名，可选
<SERVER_USER>            SSH 用户，例如 root 或 ubuntu
<PROJECT_DIR>            服务器项目目录，推荐 /opt/potato-clock
<CADDY_DIR>              Caddy compose 目录，常见为 /opt/caddy
```

如果这是你的当前域名规划，`<CLOCK_DOMAIN>` 可以填：

```text
clock.cinoo.xyz
```

不要把真实服务器 IP、SSH 用户、数据库密码、JWT secret、私钥路径写进公开文档或提交到 Git。

## 1. 部署架构

推荐链路：

```text
用户浏览器
  -> https://<CLOCK_DOMAIN>
  -> Caddy 自动 HTTPS / 反向代理
  -> clock-potato-clock:80
  -> potato-clock-nginx
  -> 官网页面
  -> /downloads/ 提供 APK / IPA 文件
  -> /api/ 转发到 potato-clock-backend:8080
  -> MySQL / Redis 仅 Docker 内网访问
```

生产 Compose 会创建：

```text
potato-clock-nginx       官网 Nginx，加入外部 proxy 网络
potato-clock-backend     Spring Boot 后端，仅内部访问
potato-clock-mysql       MySQL，仅内部访问
potato-clock-redis       Redis，仅内部访问
```

公网只让 Caddy 暴露 80 和 443；不要把 MySQL、Redis、后端 8080 直接暴露到公网。

## 2. 本仓库已准备的文件

```text
docker-compose.prod.yml       生产 Compose，适配 Caddy + proxy 网络
.env.production.example       生产环境变量示例
Caddyfile.clock.example       <CLOCK_DOMAIN> 的 Caddy 配置片段
frontend/nginx.conf           官网静态资源、下载目录和 /api 反代
downloads/README.md           安装包目录说明
```

其中 `.env.production` 是真实生产配置文件，已经被 `.gitignore` 忽略，不要提交。

## 3. 添加 DNS 解析

到域名服务商控制台，为 `<ROOT_DOMAIN>` 添加 A 记录：

```text
记录类型：A
主机记录：clock
记录值：<SERVER_IP>
TTL：默认
```

如果 `<CLOCK_DOMAIN>` 不是 `clock.<ROOT_DOMAIN>`，按实际子域名填写主机记录。

等待解析生效后，在服务器上验证：

```bash
getent hosts <CLOCK_DOMAIN>
```

看到 `<SERVER_IP>` 即可。

## 4. 登录服务器

```bash
ssh <SERVER_USER>@<SERVER_IP>
```

如果你用的是普通用户，后续命令保留 `sudo`。

## 5. 确认 Caddy 和 proxy 网络

查看当前容器和网络：

```bash
sudo docker ps --format "table {{.Names}}\t{{.Ports}}"
sudo docker network ls
```

需要存在一个统一反代网络：

```text
proxy
```

如果不存在，创建它：

```bash
sudo docker network create proxy
```

Caddy 容器也需要加入这个 `proxy` 网络，否则它不能访问 `clock-potato-clock:80`。

## 6. 准备项目目录

推荐部署到独立目录：

```bash
sudo mkdir -p <PROJECT_DIR>
sudo chown -R $USER:$USER <PROJECT_DIR>
cd <PROJECT_DIR>
```

例如：

```bash
sudo mkdir -p /opt/potato-clock
sudo chown -R $USER:$USER /opt/potato-clock
cd /opt/potato-clock
```

## 7. 获取代码

如果服务器可以访问 GitHub：

```bash
git clone https://github.com/Cinnamo-roll/PotatoClock.git .
```

如果目录已存在仓库：

```bash
git pull
```

如果服务器访问 GitHub 较慢，可以在本机打包后上传。注意不要在公开文档里写你的真实本机路径：

```bash
scp -r <LOCAL_PROJECT_DIR> <SERVER_USER>@<SERVER_IP>:<PROJECT_DIR>
```

确认目录里有：

```bash
ls
```

至少应该看到：

```text
backend
frontend
docker-compose.prod.yml
.env.production.example
```

## 8. 创建生产环境变量

```bash
cp .env.production.example .env.production
nano .env.production
```

至少修改：

```env
MYSQL_PASSWORD=<CHANGE_TO_STRONG_PASSWORD>
MYSQL_ROOT_PASSWORD=<CHANGE_TO_STRONG_ROOT_PASSWORD>
JWT_SECRET=<CHANGE_TO_RANDOM_SECRET_AT_LEAST_32_CHARS>
CORS_ALLOWED_ORIGINS=https://<CLOCK_DOMAIN>,capacitor://localhost,ionic://localhost,http://localhost,https://localhost
APP_OFFICIAL_SITE=https://<CLOCK_DOMAIN>
APP_PRIVACY_URL=https://<CLOCK_DOMAIN>/privacy
APP_ANDROID_APK_URL=https://<CLOCK_DOMAIN>/downloads/tudou-clock.apk
APP_IOS_IPA_URL=https://<CLOCK_DOMAIN>/downloads/tudou-clock.ipa
```

生成 JWT secret：

```bash
openssl rand -base64 48
```

保存：

```text
Ctrl + O
Enter
Ctrl + X
```

安全提醒：

```text
.env.production 不要提交到 Git。
不要在聊天、截图、文档里公开真实密码和 JWT_SECRET。
```

## 9. 放置 APK 和 IPA

创建下载目录：

```bash
mkdir -p downloads
```

推荐文件名：

```text
downloads/tudou-clock.apk
downloads/tudou-clock.ipa
```

从本机上传示例：

```bash
scp ./tudou-clock.apk <SERVER_USER>@<SERVER_IP>:<PROJECT_DIR>/downloads/tudou-clock.apk
scp ./tudou-clock.ipa <SERVER_USER>@<SERVER_IP>:<PROJECT_DIR>/downloads/tudou-clock.ipa
```

没有安装包也可以先部署官网；下载链接会暂时返回 404，文件放进去后会自动可用。

## 10. 启动土豆时钟

在服务器项目目录：

```bash
cd <PROJECT_DIR>
sudo docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

查看状态：

```bash
sudo docker compose -f docker-compose.prod.yml --env-file .env.production ps
```

查看日志：

```bash
sudo docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=120
```

从前端容器内部验证后端：

```bash
sudo docker exec potato-clock-nginx wget -qO- http://backend:8080/actuator/health
```

应该看到：

```json
{"status":"UP"}
```

## 11. 接入 Caddy

编辑 Caddyfile：

```bash
sudo nano <CADDY_DIR>/Caddyfile
```

追加：

```caddyfile
<CLOCK_DOMAIN> {
    encode gzip
    reverse_proxy clock-potato-clock:80
}
```

如果服务器已有项目，结构类似：

```caddyfile
<EXISTING_SITE_DOMAIN> {
    encode gzip
    reverse_proxy <EXISTING_PROJECT_ALIAS>:80
}

<CLOCK_DOMAIN> {
    encode gzip
    reverse_proxy clock-potato-clock:80
}
```

重新加载 Caddy：

```bash
cd <CADDY_DIR>
sudo docker exec -w /etc/caddy caddy caddy reload
```

如果 reload 失败，查看日志：

```bash
cd <CADDY_DIR>
sudo docker compose logs --tail=120
```

## 12. 验证访问

```bash
curl -I https://<CLOCK_DOMAIN>
curl -I https://<CLOCK_DOMAIN>/downloads/tudou-clock.apk
curl https://<CLOCK_DOMAIN>/api/public/app/info
```

期望：

```text
https://<CLOCK_DOMAIN>                       -> HTTP/2 200
/downloads/tudou-clock.apk                   -> 文件存在时 200，不存在时 404
/api/public/app/info                         -> {"code":0,"message":"success","data":...}
```

然后用浏览器打开：

```text
https://<CLOCK_DOMAIN>
```

## 13. 更新部署

有新代码：

```bash
cd <PROJECT_DIR>
git pull
sudo docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

只更新安装包（安装包不进入 Git 仓库）：

```bash
scp ./tudou-clock.apk <SERVER_USER>@<SERVER_IP>:<PROJECT_DIR>/downloads/tudou-clock.apk
scp ./tudou-clock.ipa <SERVER_USER>@<SERVER_IP>:<PROJECT_DIR>/downloads/tudou-clock.ipa
```

安装包更新后通常不需要重启容器。

正式发布建议顺序：先推送源码与文档，再在本地构建 APK，通过 `scp`/SFTP 单独覆盖服务器的 `downloads/tudou-clock.apk`，最后校验下载地址的状态码、文件大小和 SHA-256。不要把 APK、IPA、签名文件或 `.env.production` 加入 Git。

## 14. 常见排错

查看容器：

```bash
sudo docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
```

查看土豆时钟日志：

```bash
cd <PROJECT_DIR>
sudo docker compose -f docker-compose.prod.yml --env-file .env.production logs --tail=200
```

查看 Caddy 日志：

```bash
cd <CADDY_DIR>
sudo docker compose logs --tail=200
```

确认前端容器加入 `proxy` 网络：

```bash
sudo docker inspect potato-clock-nginx --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} aliases={{$v.Aliases}}{{println}}{{end}}'
```

应该看到：

```text
proxy aliases=[clock-potato-clock ...]
```

确认数据库、Redis 和后端没有暴露公网：

```bash
sudo ss -lntp | grep -E ':3306|:6379|:8080'
```

理想情况下公网监听里不应该出现土豆时钟的 MySQL、Redis 和后端 8080。

## 15. 上线前检查清单

```text
[ ] DNS 已解析到服务器
[ ] 安全组只开放 80 / 443
[ ] proxy 网络存在，Caddy 和 potato-clock-nginx 都已加入
[ ] .env.production 已替换强密码和 JWT_SECRET
[ ] docker compose ps 全部 healthy / running
[ ] Caddy reload 成功
[ ] https://<CLOCK_DOMAIN> 返回 200
[ ] /api/public/app/info 返回统一响应
[ ] APK / IPA 文件已放入 downloads 目录
```

## 16. 敏感信息处理规则

可以提交：

```text
示例域名、示例命令、容器名、Docker 网络名、占位符、公开下载路径格式
```

不要提交：

```text
真实公网 IP
真实 SSH 用户和私钥路径
真实数据库密码
真实 JWT_SECRET
真实 .env.production
服务器上其他项目的私有域名或目录细节
正式 APK / IPA 二进制包
```
