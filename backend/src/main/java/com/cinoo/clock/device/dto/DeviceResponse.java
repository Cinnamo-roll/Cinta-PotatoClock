package com.cinoo.clock.device.dto;

import com.cinoo.clock.common.enums.DevicePlatform;
import com.cinoo.clock.device.entity.UserDevice;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "User app device")
public record DeviceResponse(
        Long id,
        Long userId,
        DevicePlatform platform,
        String deviceId,
        String deviceName,
        String appVersion,
        String buildNumber,
        String pushToken,
        LocalDateTime lastActiveAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static DeviceResponse from(UserDevice device) {
        return new DeviceResponse(
                device.getId(),
                device.getUserId(),
                device.getPlatform(),
                device.getDeviceId(),
                device.getDeviceName(),
                device.getAppVersion(),
                device.getBuildNumber(),
                device.getPushToken(),
                device.getLastActiveAt(),
                device.getCreatedAt(),
                device.getUpdatedAt()
        );
    }
}
