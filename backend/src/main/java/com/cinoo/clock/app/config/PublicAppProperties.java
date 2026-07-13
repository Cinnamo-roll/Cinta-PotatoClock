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
        private String version = "1.2.7";
        private String buildNumber = "10";
        private LocalDate releaseDate = LocalDate.of(2026, 7, 13);
        private boolean forceUpdate = true;
        private List<String> changelog = new ArrayList<>(List.of(
                "Android 与 iOS 状态栏改用沉浸式安全区布局，不再填充突兀粉色",
                "清理启动页、默认待办和打卡动效中的历史固定粉色",
                "官网减少大面积白底，手机预览统一为土豆金、奶油与叶绿配色",
                "本版本设为必要更新，旧版本需更新后继续使用"
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
