package com.cinoo.clock.app.service;

import com.cinoo.clock.app.config.PublicAppProperties;
import com.cinoo.clock.app.dto.AppDownloadsResponse;
import com.cinoo.clock.app.dto.AppInfoResponse;
import com.cinoo.clock.app.dto.AppReleaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PublicAppService {
    private final PublicAppProperties properties;

    public AppInfoResponse info() {
        return AppInfoResponse.from(properties.getInfo());
    }

    public AppReleaseResponse latestRelease() {
        return AppReleaseResponse.from(properties.getRelease());
    }

    public AppDownloadsResponse downloads() {
        return AppDownloadsResponse.from(properties.getDownloads());
    }
}
