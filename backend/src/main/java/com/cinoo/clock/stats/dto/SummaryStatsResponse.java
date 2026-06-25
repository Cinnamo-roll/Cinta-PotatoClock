package com.cinoo.clock.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Summary focus stats")
public record SummaryStatsResponse(
        Long totalFocusCount,
        Long totalFocusMinutes,
        Long totalFocusSeconds,
        Long averageDailyFocusMinutes,
        Long averageDailyFocusSeconds,
        Long totalAbandonedCount
) {
}
