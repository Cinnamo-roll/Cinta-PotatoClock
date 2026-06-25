package com.cinoo.clock.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Focus duration distribution item")
public record DistributionStatsResponse(
        String label,
        String key,
        LocalDate date,
        Long focusCount,
        Long focusMinutes,
        Long focusSeconds,
        Long abandonedCount,
        Double percent
) {
}
