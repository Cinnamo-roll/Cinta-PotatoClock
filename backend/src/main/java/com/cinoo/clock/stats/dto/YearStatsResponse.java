package com.cinoo.clock.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Yearly focus stats")
public record YearStatsResponse(
        Integer year,
        Long focusCount,
        Long focusMinutes,
        Long focusSeconds,
        Long abandonedCount,
        Double completionRate,
        Integer activeDays,
        Integer longestStreakDays,
        List<YearMonthTrendResponse> monthlyTrend
) {
}
