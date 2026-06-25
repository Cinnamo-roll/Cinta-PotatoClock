package com.cinoo.clock.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Monthly focus period distribution item")
public record PeriodDistributionResponse(
        String label,
        Integer hour,
        Long focusCount,
        Long focusMinutes,
        Long focusSeconds
) {
}
