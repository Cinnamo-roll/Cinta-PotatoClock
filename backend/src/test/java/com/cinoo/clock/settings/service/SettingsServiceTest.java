package com.cinoo.clock.settings.service;

import com.cinoo.clock.TestSecurity;
import com.cinoo.clock.common.enums.ErrorCode;
import com.cinoo.clock.common.exception.BusinessException;
import com.cinoo.clock.settings.dto.UpdateSettingsRequest;
import com.cinoo.clock.settings.entity.UserSetting;
import com.cinoo.clock.settings.repository.UserSettingRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class SettingsServiceTest {
    @AfterEach
    void tearDown() {
        TestSecurity.clear();
    }

    @Test
    void updateSettingsPersistsAndRefreshesCache() {
        TestSecurity.loginAs(1L);
        UserSettingRepository repository = mock(UserSettingRepository.class);
        UserSetting setting = UserSetting.defaults(1L);
        when(repository.findByUserId(1L)).thenReturn(Optional.of(setting));
        StringRedisTemplate redis = mock(StringRedisTemplate.class);
        @SuppressWarnings("unchecked")
        ValueOperations<String, String> valueOperations = mock(ValueOperations.class);
        when(redis.opsForValue()).thenReturn(valueOperations);
        ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
        SettingsService service = new SettingsService(repository, redis, objectMapper);

        var response = service.updateCurrentSettings(new UpdateSettingsRequest(30, null, null, false, null, "custom", "#8EC5FF", "week", "sunday", false, false, false, false, false, null, null, null, null, null, null, null, null, null, null, null, null, null));

        assertThat(response.defaultDurationMinutes()).isEqualTo(30);
        assertThat(response.notificationEnabled()).isFalse();
        assertThat(response.themeColor()).isEqualTo("custom");
        assertThat(response.customThemeColor()).isEqualTo("#8EC5FF");
        assertThat(response.defaultStatsRange()).isEqualTo("week");
        assertThat(response.weekStartDay()).isEqualTo("sunday");
        assertThat(response.showMonthStats()).isFalse();
        assertThat(response.showCheckinStats()).isFalse();
        assertThat(response.showYearStats()).isFalse();
        verify(valueOperations).set(eq("settings:1"), anyString(), any());
    }

    @Test
    void customThemeRequiresHexColor() {
        TestSecurity.loginAs(1L);
        UserSettingRepository repository = mock(UserSettingRepository.class);
        when(repository.findByUserId(1L)).thenReturn(Optional.of(UserSetting.defaults(1L)));
        StringRedisTemplate redis = mock(StringRedisTemplate.class);
        when(redis.opsForValue()).thenReturn(mock(ValueOperations.class));
        SettingsService service = new SettingsService(repository, redis, new ObjectMapper().registerModule(new JavaTimeModule()));

        assertThatThrownBy(() -> service.updateCurrentSettings(new UpdateSettingsRequest(null, null, null, null, null, "custom", "blue", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null)))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.PARAM_ERROR);
    }
}
