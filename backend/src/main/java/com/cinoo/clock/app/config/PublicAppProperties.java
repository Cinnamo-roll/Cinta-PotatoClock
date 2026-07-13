package com.cinoo.clock.app.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app")
public class PublicAppProperties {
    private Info info = new Info();
    private Release release = new Release();
    private Downloads downloads = new Downloads();

    @Getter
    @Setter
    public static class Info {
        private String appName = "土豆时钟";
        private String slogan = "把今天切成更容易开始的一小块";
        private String description = "专注、倒计时、习惯和目标管理一体的移动端时钟。";
        private String officialSite = "https://clock.cinoo.xyz";
        private String privacyUrl = "https://clock.cinoo.xyz/privacy";
        private String supportEmail = "support@clock.cinoo.xyz";
    }

    @Getter
    @Setter
    public static class Release {
        private String version = "1.2.5";
        private String buildNumber = "8";
        private LocalDate releaseDate = LocalDate.of(2026, 7, 13);
        private boolean forceUpdate = false;
        private List<String> changelog = new ArrayList<>(List.of(
                "新增应用内版本检查，Android 直达 APK 更新，iOS 前往官网",
                "补充待办集删除入口并保留集内待办",
                "新增未登录全页面只读预览，重做统一演示数据与登录引导",
                "重做土豆金主题、缩小 Android 图标并优化滚动动画"
        ));
        private Platform ios = new Platform();
        private Platform android = new Platform();
    }

    @Getter
    @Setter
    public static class Platform {
        private boolean available = true;
        private String downloadUrl;
        private String installNote;
    }

    @Getter
    @Setter
    public static class Downloads {
        private Asset android = new Asset();
        private Asset ios = new Asset();
        private ExternalLink testflight = new ExternalLink();
        private ExternalLink appStore = new ExternalLink();
    }

    @Getter
    @Setter
    public static class Asset {
        private String url;
        private String version = "1.0.0";
        private String size;
        private boolean requiresSelfSigning = false;
        private String note;
    }

    @Getter
    @Setter
    public static class ExternalLink {
        private boolean available = false;
        private String url;
    }
}
