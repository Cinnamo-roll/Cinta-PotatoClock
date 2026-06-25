package com.cinoo.clock.app.controller;

import com.cinoo.clock.app.dto.AppDownloadsResponse;
import com.cinoo.clock.app.dto.AppInfoResponse;
import com.cinoo.clock.app.dto.AppReleaseResponse;
import com.cinoo.clock.app.service.PublicAppService;
import com.cinoo.clock.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Public App", description = "Public app info and download metadata")
@RestController
@RequestMapping("/api/public/app")
@RequiredArgsConstructor
public class PublicAppController {
    private final PublicAppService publicAppService;

    @Operation(summary = "Get public app info")
    @GetMapping("/info")
    public ApiResponse<AppInfoResponse> info() {
        return ApiResponse.success(publicAppService.info());
    }

    @Operation(summary = "Get latest app release")
    @GetMapping("/releases/latest")
    public ApiResponse<AppReleaseResponse> latestRelease() {
        return ApiResponse.success(publicAppService.latestRelease());
    }

    @Operation(summary = "Get app download links")
    @GetMapping("/downloads")
    public ApiResponse<AppDownloadsResponse> downloads() {
        return ApiResponse.success(publicAppService.downloads());
    }
}
