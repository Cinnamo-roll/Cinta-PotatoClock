package com.cinoo.clock.settings.controller;

import com.cinoo.clock.common.response.ApiResponse;
import com.cinoo.clock.settings.dto.SettingsResponse;
import com.cinoo.clock.settings.dto.UpdateSettingsRequest;
import com.cinoo.clock.settings.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Settings", description = "土豆时钟用户设置")
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {
    private final SettingsService settingsService;

    @Operation(summary = "获取用户设置")
    @GetMapping
    public ApiResponse<SettingsResponse> get() {
        return ApiResponse.success(settingsService.getCurrentSettings());
    }

    @Operation(summary = "更新用户设置")
    @PutMapping
    public ApiResponse<SettingsResponse> update(@Valid @RequestBody UpdateSettingsRequest request) {
        return ApiResponse.success(settingsService.updateCurrentSettings(request));
    }
}
