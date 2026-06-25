package com.cinoo.clock.app.dto;

import com.cinoo.clock.app.config.PublicAppProperties;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Public app download links")
public record AppDownloadsResponse(
        AndroidDownload android,
        IosDownload ios,
        ExternalDownload testflight,
        ExternalDownload appStore
) {
    public static AppDownloadsResponse from(PublicAppProperties.Downloads downloads) {
        return new AppDownloadsResponse(
                AndroidDownload.from(downloads.getAndroid()),
                IosDownload.from(downloads.getIos()),
                ExternalDownload.from(downloads.getTestflight()),
                ExternalDownload.from(downloads.getAppStore())
        );
    }

    public record AndroidDownload(
            String apkUrl,
            String version,
            String size
    ) {
        static AndroidDownload from(PublicAppProperties.Asset asset) {
            return new AndroidDownload(asset.getUrl(), asset.getVersion(), asset.getSize());
        }
    }

    public record IosDownload(
            String ipaUrl,
            String version,
            String size,
            Boolean requiresSelfSigning,
            String note
    ) {
        static IosDownload from(PublicAppProperties.Asset asset) {
            return new IosDownload(asset.getUrl(), asset.getVersion(), asset.getSize(), asset.isRequiresSelfSigning(), asset.getNote());
        }
    }

    public record ExternalDownload(
            Boolean available,
            String url
    ) {
        static ExternalDownload from(PublicAppProperties.ExternalLink link) {
            return new ExternalDownload(link.isAvailable(), link.getUrl());
        }
    }
}
