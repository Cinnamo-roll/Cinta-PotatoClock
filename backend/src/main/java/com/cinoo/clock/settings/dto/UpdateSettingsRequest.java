package com.cinoo.clock.settings.dto;

import com.cinoo.clock.common.enums.ThemeMode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

@Schema(description = "Update user timer settings request")
public record UpdateSettingsRequest(
        @Min(1) @Max(180) Integer defaultDurationMinutes,
        Boolean soundEnabled,
        Boolean vibrationEnabled,
        Boolean notificationEnabled,
        ThemeMode themeMode,
        @Size(max = 50, message = "themeColor max length is 50") String themeColor,
        @Size(max = 20, message = "customThemeColor max length is 20") String customThemeColor,
        @Size(max = 20, message = "defaultStatsRange max length is 20") String defaultStatsRange,
        @Size(max = 20, message = "weekStartDay max length is 20") String weekStartDay,
        Boolean showMonthStats,
        Boolean showInterruptionReasons,
        Boolean showTaskRanking,
        Boolean showCheckinStats,
        Boolean showYearStats,
        Boolean autoStartNext,
        @Size(max = 200, message = "focusMotto max length is 200") String focusMotto,
        @Min(1) @Max(120) Integer breakMinutes,
        @Min(1) @Max(180) Integer pauseLimitMinutes,
        @Size(max = 50, message = "completionSound max length is 50") String completionSound,
        Boolean studyModeEnabled,
        Boolean countdownAutoContinueEnabled,
        @Min(1) @Max(180) Integer focusMinutes,
        @Min(1) @Max(60) Integer shortBreakMinutes,
        @Min(1) @Max(120) Integer longBreakMinutes,
        @Min(1) @Max(12) Integer longBreakInterval,
        Boolean autoStartBreak,
        Boolean autoStartFocus
) {
}
