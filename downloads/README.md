# 安装包目录

`downloads/` 是官网安装包的服务器挂载目录。仓库只保留目录说明，APK、IPA 和签名文件由发布流程单独上传。

固定文件名：

```text
downloads/tudou-clock.apk
downloads/tudou-clock.ipa
```

公开地址：

- Android：<https://clock.cinoo.xyz/downloads/tudou-clock.apk>
- iOS：<https://clock.cinoo.xyz/downloads/tudou-clock.ipa>

替换文件后建议同时核对 HTTP 状态码、文件大小和 SHA-256。只更新同名安装包时通常不需要重启 Nginx。
