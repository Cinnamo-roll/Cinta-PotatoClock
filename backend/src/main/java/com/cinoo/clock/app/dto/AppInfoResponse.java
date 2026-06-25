package com.cinoo.clock.app.dto;

import com.cinoo.clock.app.config.PublicAppProperties;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Public app info")
public record AppInfoResponse(
        String appName,
        String slogan,
        String description,
        String officialSite,
        String privacyUrl,
        String supportEmail
) {
    public static AppInfoResponse from(PublicAppProperties.Info info) {
        return new AppInfoResponse(
                info.getAppName(),
                info.getSlogan(),
                info.getDescription(),
                info.getOfficialSite(),
                info.getPrivacyUrl(),
                info.getSupportEmail()
        );
    }
}
