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
        private String officialSite = "https://cinoo.xyz";
        private String privacyUrl = "https://cinoo.xyz/privacy";
        private String supportEmail = "support@clock.cinoo.xyz";
    }

    @Getter
    @Setter
    public static class Release {
        private String version = "1.2.2";
        private String buildNumber = "5";
        private LocalDate releaseDate = LocalDate.of(2026, 7, 12);
        private boolean forceUpdate = false;
        private List<String> changelog = new ArrayList<>(List.of("修复 Android 8/9 启动闪退", "官网与作者网站统一为 cinoo.xyz"));
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
