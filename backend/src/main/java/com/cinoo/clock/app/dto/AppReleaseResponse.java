package com.cinoo.clock.app.dto;

import com.cinoo.clock.app.config.PublicAppProperties;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Latest public app release")
public record AppReleaseResponse(
        String version,
        String buildNumber,
        LocalDate releaseDate,
        Boolean forceUpdate,
        List<String> changelog,
        PlatformRelease ios,
        PlatformRelease android
) {
    public static AppReleaseResponse from(PublicAppProperties.Release release) {
        return new AppReleaseResponse(
                release.getVersion(),
                release.getBuildNumber(),
                release.getReleaseDate(),
                release.isForceUpdate(),
                release.getChangelog(),
                PlatformRelease.from(release.getIos()),
                PlatformRelease.from(release.getAndroid())
        );
    }

    public record PlatformRelease(
            Boolean available,
            String downloadUrl,
            String installNote
    ) {
        static PlatformRelease from(PublicAppProperties.Platform platform) {
            return new PlatformRelease(platform.isAvailable(), platform.getDownloadUrl(), platform.getInstallNote());
        }
    }
}
