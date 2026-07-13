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
        private String version = "1.2.6";
        private String buildNumber = "9";
        private LocalDate releaseDate = LocalDate.of(2026, 7, 13);
        private boolean forceUpdate = false;
        private List<String> changelog = new ArrayList<>(List.of(
                "修复旧登录凭证干扰登录注册的问题",
                "恢复游客页面滑动、导航与待办集展开交互",
                "移除预览提示中的设置入口并保持演示数据只读",
                "优化登录注册排版，首次进入默认使用土豆金主题"
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
