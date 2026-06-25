package com.cinoo.clock.device.dto;

import com.cinoo.clock.common.enums.DevicePlatform;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Register or update current app device")
public record DeviceRegisterRequest(
        @NotNull DevicePlatform platform,
        @NotBlank @Size(max = 120) String deviceId,
        @Size(max = 120) String deviceName,
        @Size(max = 50) String appVersion,
        @Size(max = 50) String buildNumber,
        @Size(max = 500) String pushToken
) {
}
