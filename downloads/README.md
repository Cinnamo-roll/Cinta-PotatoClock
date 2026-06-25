# 安装包目录

上线时把安装包放在这个目录：

```text
downloads/tudou-clock.apk
downloads/tudou-clock.ipa
```

部署后官网会提供：

```text
https://clock.cinoo.xyz/downloads/tudou-clock.apk
https://clock.cinoo.xyz/downloads/tudou-clock.ipa
```

不要把大型正式安装包提交到 Git；建议通过 `scp`、SFTP 或服务器构建产物复制到 `/opt/potato-clock/downloads/`。
