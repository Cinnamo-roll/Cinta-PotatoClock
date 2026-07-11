# 安装包目录

此目录在 Git 中只保留说明和 `.gitkeep`。正式安装包通过 `scp`、SFTP 或发布流水线单独上传，不提交到 GitHub。

服务器使用以下固定文件名：

```text
downloads/tudou-clock.apk
downloads/tudou-clock.ipa
```

对应公开下载地址：

```text
https://clock.cinoo.xyz/downloads/tudou-clock.apk
https://clock.cinoo.xyz/downloads/tudou-clock.ipa
```

更新安装包后应核对 HTTP 状态码、文件大小与 SHA-256；只替换安装包通常不需要重启容器。
