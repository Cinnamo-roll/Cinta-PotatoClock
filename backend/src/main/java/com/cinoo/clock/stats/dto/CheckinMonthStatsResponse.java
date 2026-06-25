package com.cinoo.clock.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Daily checkin stats item")
public record CheckinMonthStatsResponse(
        LocalDate date,
        Long wakeupCount,
        Long sleepCount,
        Long totalCount
) {
}
