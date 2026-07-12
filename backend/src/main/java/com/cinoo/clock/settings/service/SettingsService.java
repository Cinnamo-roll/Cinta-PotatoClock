/*
 * Copyright 2026 CintaOvO
 * Licensed under the Apache License, Version 2.0.
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

package com.cinoo.clock.settings.service;

import com.cinoo.clock.security.SecurityUtils;
import com.cinoo.clock.settings.dto.SettingsResponse;
import com.cinoo.clock.settings.dto.UpdateSettingsRequest;
import com.cinoo.clock.settings.entity.UserSetting;
import com.cinoo.clock.settings.repository.UserSettingRepository;
import com.cinoo.clock.common.enums.ErrorCode;
import com.cinoo.clock.common.exception.BusinessException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class SettingsService {
    private static final Set<String> THEME_COLORS = Set.of("rose", "mint", "sky", "cream", "lavender", "mocha", "custom");
    private static final Set<String> STATS_RANGES = Set.of("day", "week", "month");
    private static final Set<String> WEEK_START_DAYS = Set.of("monday", "sunday");
    private static final Pattern HEX_COLOR = Pattern.compile("^#[0-9a-fA-F]{6}$");

    private final UserSettingRepository settingRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Transactional
    public SettingsResponse getCurrentSettings() {
        Long userId = SecurityUtils.currentUserId();
        String cached = redisTemplate.opsForValue().get(cacheKey(userId));
        if (cached != null) {
            try {
                return objectMapper.readValue(cached, SettingsResponse.class);
            } catch (JsonProcessingException ignored) {
                redisTemplate.delete(cacheKey(userId));
            }
        }
        SettingsResponse response = SettingsResponse.from(findOrCreate(userId));
        cache(userId, response);
        return response;
    }

    @Transactional
    public SettingsResponse updateCurrentSettings(UpdateSettingsRequest request) {
        Long userId = SecurityUtils.currentUserId();
        UserSetting setting = findOrCreate(userId);
        if (request.defaultDurationMinutes() != null) setting.setDefaultDurationMinutes(request.defaultDurationMinutes());
        if (request.soundEnabled() != null) setting.setSoundEnabled(request.soundEnabled());
        if (request.vibrationEnabled() != null) setting.setVibrationEnabled(request.vibrationEnabled());
        if (request.notificationEnabled() != null) setting.setNotificationEnabled(request.notificationEnabled());
        if (request.themeMode() != null) setting.setThemeMode(request.themeMode());
        applyTheme(request, setting);
        applyStatsSettings(request, setting);
        if (request.autoStartNext() != null) setting.setAutoStartNext(request.autoStartNext());
        if (request.focusMotto() != null) setting.setFocusMotto(request.focusMotto().isBlank() ? null : request.focusMotto());
        if (request.breakMinutes() != null) setting.setBreakMinutes(request.breakMinutes());
        if (request.pauseLimitMinutes() != null) setting.setPauseLimitMinutes(request.pauseLimitMinutes());
        if (request.completionSound() != null && !request.completionSound().isBlank()) setting.setCompletionSound(request.completionSound());
        if (request.studyModeEnabled() != null) setting.setStudyModeEnabled(request.studyModeEnabled());
        if (request.countdownAutoContinueEnabled() != null) setting.setCountdownAutoContinueEnabled(request.countdownAutoContinueEnabled());
        if (request.focusMinutes() != null) setting.setFocusMinutes(request.focusMinutes());
        if (request.shortBreakMinutes() != null) setting.setShortBreakMinutes(request.shortBreakMinutes());
        if (request.longBreakMinutes() != null) setting.setLongBreakMinutes(request.longBreakMinutes());
        if (request.longBreakInterval() != null) setting.setLongBreakInterval(request.longBreakInterval());
        if (request.autoStartBreak() != null) setting.setAutoStartBreak(request.autoStartBreak());
        if (request.autoStartFocus() != null) setting.setAutoStartFocus(request.autoStartFocus());
        SettingsResponse response = SettingsResponse.from(setting);
        cache(userId, response);
        return response;
    }

    private void applyStatsSettings(UpdateSettingsRequest request, UserSetting setting) {
        if (request.defaultStatsRange() != null && !request.defaultStatsRange().isBlank()) {
            String range = request.defaultStatsRange().trim();
            if (!STATS_RANGES.contains(range)) {
                throw new BusinessException(ErrorCode.PARAM_ERROR, "defaultStatsRange must be day, week, or month");
            }
            setting.setDefaultStatsRange(range);
        }
        if (request.weekStartDay() != null && !request.weekStartDay().isBlank()) {
            String weekStartDay = request.weekStartDay().trim();
            if (!WEEK_START_DAYS.contains(weekStartDay)) {
                throw new BusinessException(ErrorCode.PARAM_ERROR, "weekStartDay must be monday or sunday");
            }
            setting.setWeekStartDay(weekStartDay);
        }
        if (request.showMonthStats() != null) setting.setShowMonthStats(request.showMonthStats());
        if (request.showInterruptionReasons() != null) setting.setShowInterruptionReasons(request.showInterruptionReasons());
        if (request.showTaskRanking() != null) setting.setShowTaskRanking(request.showTaskRanking());
        if (request.showCheckinStats() != null) setting.setShowCheckinStats(request.showCheckinStats());
        if (request.showYearStats() != null) setting.setShowYearStats(request.showYearStats());
    }

    private void applyTheme(UpdateSettingsRequest request, UserSetting setting) {
        String nextThemeColor = setting.getThemeColor();
        String nextCustomThemeColor = setting.getCustomThemeColor();
        if (request.themeColor() != null && !request.themeColor().isBlank()) {
            nextThemeColor = request.themeColor().trim();
        }
        if (request.customThemeColor() != null) {
            nextCustomThemeColor = request.customThemeColor().isBlank() ? null : request.customThemeColor().trim();
        }
        validateTheme(nextThemeColor, nextCustomThemeColor);
        setting.setThemeColor(nextThemeColor);
        setting.setCustomThemeColor("custom".equals(nextThemeColor) ? nextCustomThemeColor : null);
    }

    private void validateTheme(String themeColor, String customThemeColor) {
        if (!THEME_COLORS.contains(themeColor)) {
            throw new BusinessException(ErrorCode.PARAM_ERROR,
                    "themeColor must be one of rose, mint, sky, cream, lavender, mocha, custom");
        }
        if ("custom".equals(themeColor) && (customThemeColor == null || !HEX_COLOR.matcher(customThemeColor).matches())) {
            throw new BusinessException(ErrorCode.PARAM_ERROR,
                    "customThemeColor must be a valid hex color when themeColor is custom");
        }
        if (customThemeColor != null && !HEX_COLOR.matcher(customThemeColor).matches()) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "customThemeColor must be a valid hex color");
        }
    }

    private UserSetting findOrCreate(Long userId) {
        return settingRepository.findByUserId(userId)
                .orElseGet(() -> settingRepository.save(UserSetting.defaults(userId)));
    }

    private void cache(Long userId, SettingsResponse response) {
        try {
            redisTemplate.opsForValue().set(cacheKey(userId), objectMapper.writeValueAsString(response), Duration.ofHours(12));
        } catch (JsonProcessingException ignored) {
            redisTemplate.delete(cacheKey(userId));
        }
    }

    private String cacheKey(Long userId) {
        return "settings:" + userId;
    }
}
