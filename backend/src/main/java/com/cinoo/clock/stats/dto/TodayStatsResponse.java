package com.cinoo.clock.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Today focus stats")
public record TodayStatsResponse(
        Long todayFocusCount,
        Long todayFocusMinutes,
        Long todayFocusSeconds,
        Long todayAbandonedCount
) {
}
