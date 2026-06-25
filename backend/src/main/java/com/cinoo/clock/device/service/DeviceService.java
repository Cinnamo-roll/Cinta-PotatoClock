package com.cinoo.clock.device.service;

import com.cinoo.clock.common.enums.ErrorCode;
import com.cinoo.clock.common.exception.BusinessException;
import com.cinoo.clock.device.dto.DeviceRegisterRequest;
import com.cinoo.clock.device.dto.DeviceResponse;
import com.cinoo.clock.device.entity.UserDevice;
import com.cinoo.clock.device.repository.UserDeviceRepository;
import com.cinoo.clock.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DeviceService {
    private final UserDeviceRepository deviceRepository;

    @Transactional
    public DeviceResponse register(DeviceRegisterRequest request) {
        Long userId = SecurityUtils.currentUserId();
        UserDevice device = deviceRepository.findByUserIdAndDeviceId(userId, request.deviceId())
                .orElseGet(() -> {
                    UserDevice created = new UserDevice();
                    created.setUserId(userId);
                    created.setDeviceId(request.deviceId());
                    return created;
                });
        apply(request, device);
        device.setLastActiveAt(LocalDateTime.now());
        return DeviceResponse.from(deviceRepository.save(device));
    }

    @Transactional
    public DeviceResponse updateCurrent(DeviceRegisterRequest request) {
        Long userId = SecurityUtils.currentUserId();
        UserDevice device = deviceRepository.findByUserIdAndDeviceId(userId, request.deviceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        apply(request, device);
        device.setLastActiveAt(LocalDateTime.now());
        return DeviceResponse.from(device);
    }

    @Transactional(readOnly = true)
    public DeviceResponse getCurrent(String deviceId) {
        Long userId = SecurityUtils.currentUserId();
        UserDevice device = deviceRepository.findByUserIdAndDeviceId(userId, requireDeviceId(deviceId))
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        return DeviceResponse.from(device);
    }

    @Transactional
    public void deleteCurrent(String deviceId) {
        Long userId = SecurityUtils.currentUserId();
        String normalizedDeviceId = requireDeviceId(deviceId);
        if (deviceRepository.findByUserIdAndDeviceId(userId, normalizedDeviceId).isEmpty()) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        deviceRepository.deleteByUserIdAndDeviceId(userId, normalizedDeviceId);
    }

    private void apply(DeviceRegisterRequest request, UserDevice device) {
        device.setPlatform(request.platform());
        device.setDeviceName(blankToNull(request.deviceName()));
        device.setAppVersion(blankToNull(request.appVersion()));
        device.setBuildNumber(blankToNull(request.buildNumber()));
        device.setPushToken(blankToNull(request.pushToken()));
    }

    private String requireDeviceId(String deviceId) {
        if (deviceId == null || deviceId.isBlank()) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "deviceId is required");
        }
        return deviceId.trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
