package com.cinoo.clock.device.controller;

import com.cinoo.clock.common.response.ApiResponse;
import com.cinoo.clock.device.dto.DeviceRegisterRequest;
import com.cinoo.clock.device.dto.DeviceResponse;
import com.cinoo.clock.device.service.DeviceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Devices", description = "App device management")
@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {
    private final DeviceService deviceService;

    @Operation(summary = "Register current device")
    @PostMapping("/register")
    public ApiResponse<DeviceResponse> register(@Valid @RequestBody DeviceRegisterRequest request) {
        return ApiResponse.success(deviceService.register(request));
    }

    @Operation(summary = "Update current device")
    @PutMapping("/current")
    public ApiResponse<DeviceResponse> updateCurrent(@Valid @RequestBody DeviceRegisterRequest request) {
        return ApiResponse.success(deviceService.updateCurrent(request));
    }

    @Operation(summary = "Get current device")
    @GetMapping("/current")
    public ApiResponse<DeviceResponse> getCurrent(HttpServletRequest request) {
        return ApiResponse.success(deviceService.getCurrent(deviceId(request)));
    }

    @Operation(summary = "Delete current device")
    @DeleteMapping("/current")
    public ApiResponse<Void> deleteCurrent(HttpServletRequest request) {
        deviceService.deleteCurrent(deviceId(request));
        return ApiResponse.success();
    }

    private String deviceId(HttpServletRequest request) {
        String header = request.getHeader("X-Device-Id");
        return header != null && !header.isBlank() ? header : request.getParameter("deviceId");
    }
}
