package com.cinoo.clock.settings.dto;

import com.cinoo.clock.common.enums.ThemeMode;
import com.cinoo.clock.settings.entity.UserSetting;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "User timer settings")
public record SettingsResponse(
        Long id,
        Long userId,
        Integer defaultDurationMinutes,
        Boolean soundEnabled,
        Boolean vibrationEnabled,
        Boolean notificationEnabled,
        ThemeMode themeMode,
        String themeColor,
        String customThemeColor,
        String defaultStatsRange,
        String weekStartDay,
        Boolean showMonthStats,
        Boolean showInterruptionReasons,
        Boolean showTaskRanking,
        Boolean showCheckinStats,
        Boolean showYearStats,
        Boolean autoStartNext,
        String focusMotto,
        Integer breakMinutes,
        Integer pauseLimitMinutes,
        String completionSound,
        Boolean studyModeEnabled,
        Boolean countdownAutoContinueEnabled,
        Integer focusMinutes,
        Integer shortBreakMinutes,
        Integer longBreakMinutes,
        Integer longBreakInterval,
        Boolean autoStartBreak,
        Boolean autoStartFocus
) {
    public static SettingsResponse from(UserSetting setting) {
        return new SettingsResponse(
                setting.getId(),
                setting.getUserId(),
                setting.getDefaultDurationMinutes(),
                setting.getSoundEnabled(),
                setting.getVibrationEnabled(),
                setting.getNotificationEnabled(),
                setting.getThemeMode(),
                setting.getThemeColor(),
                setting.getCustomThemeColor(),
                setting.getDefaultStatsRange(),
                setting.getWeekStartDay(),
                setting.getShowMonthStats(),
                setting.getShowInterruptionReasons(),
                setting.getShowTaskRanking(),
                setting.getShowCheckinStats(),
                setting.getShowYearStats(),
                setting.getAutoStartNext(),
                setting.getFocusMotto(),
                setting.getBreakMinutes(),
                setting.getPauseLimitMinutes(),
                setting.getCompletionSound(),
                setting.getStudyModeEnabled(),
                setting.getCountdownAutoContinueEnabled(),
                setting.getFocusMinutes(),
                setting.getShortBreakMinutes(),
                setting.getLongBreakMinutes(),
                setting.getLongBreakInterval(),
                setting.getAutoStartBreak(),
                setting.getAutoStartFocus()
        );
    }
}
