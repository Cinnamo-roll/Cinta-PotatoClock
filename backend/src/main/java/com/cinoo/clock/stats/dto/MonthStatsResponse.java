package com.cinoo.clock.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Monthly focus stats")
public record MonthStatsResponse(
        String month,
        Long focusCount,
        Long focusMinutes,
        Long focusSeconds,
        Long abandonedCount,
        Double completionRate,
        Integer activeDays
) {
}
