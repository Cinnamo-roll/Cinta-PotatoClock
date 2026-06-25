package com.cinoo.clock.device.service;

import com.cinoo.clock.TestSecurity;
import com.cinoo.clock.common.enums.DevicePlatform;
import com.cinoo.clock.common.enums.ErrorCode;
import com.cinoo.clock.common.exception.BusinessException;
import com.cinoo.clock.device.dto.DeviceRegisterRequest;
import com.cinoo.clock.device.entity.UserDevice;
import com.cinoo.clock.device.repository.UserDeviceRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DeviceServiceTest {
    @AfterEach
    void tearDown() {
        TestSecurity.clear();
    }

    @Test
    void registerCreatesDeviceForCurrentUser() {
        TestSecurity.loginAs(1L);
        UserDeviceRepository repository = mock(UserDeviceRepository.class);
        when(repository.findByUserIdAndDeviceId(1L, "iphone-1")).thenReturn(Optional.empty());
        when(repository.save(any(UserDevice.class))).thenAnswer(invocation -> invocation.getArgument(0));
        DeviceService service = new DeviceService(repository);

        var response = service.register(new DeviceRegisterRequest(DevicePlatform.ios, "iphone-1", "iPhone", "1.0.0", "1", "token"));

        assertThat(response.userId()).isEqualTo(1L);
        assertThat(response.platform()).isEqualTo(DevicePlatform.ios);
        assertThat(response.appVersion()).isEqualTo("1.0.0");
        verify(repository).save(any(UserDevice.class));
    }

    @Test
    void duplicateRegisterUpdatesExistingDevice() {
        TestSecurity.loginAs(1L);
        UserDevice existing = new UserDevice();
        existing.setUserId(1L);
        existing.setDeviceId("android-1");
        existing.setPlatform(DevicePlatform.android);
        existing.setAppVersion("1.0.0");
        UserDeviceRepository repository = mock(UserDeviceRepository.class);
        when(repository.findByUserIdAndDeviceId(1L, "android-1")).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(existing);
        DeviceService service = new DeviceService(repository);

        var response = service.register(new DeviceRegisterRequest(DevicePlatform.android, "android-1", "Pixel", "1.0.1", "2", null));

        assertThat(response.appVersion()).isEqualTo("1.0.1");
        assertThat(response.buildNumber()).isEqualTo("2");
        assertThat(response.lastActiveAt()).isNotNull();
        verify(repository).save(existing);
    }

    @Test
    void currentUserCannotReadAnotherUsersDevice() {
        TestSecurity.loginAs(2L);
        UserDeviceRepository repository = mock(UserDeviceRepository.class);
        when(repository.findByUserIdAndDeviceId(2L, "shared-device")).thenReturn(Optional.empty());
        DeviceService service = new DeviceService(repository);

        assertThatThrownBy(() -> service.getCurrent("shared-device"))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.RESOURCE_NOT_FOUND);
        verify(repository).findByUserIdAndDeviceId(2L, "shared-device");
    }
}
