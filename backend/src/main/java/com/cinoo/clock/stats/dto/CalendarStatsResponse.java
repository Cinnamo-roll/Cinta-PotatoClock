package com.cinoo.clock.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Calendar focus stats item")
public record CalendarStatsResponse(
        LocalDate date,
        Long focusCount,
        Long focusMinutes,
        Long focusSeconds,
        Long abandonedCount
) {
}
