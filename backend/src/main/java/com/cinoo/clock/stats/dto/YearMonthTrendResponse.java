package com.cinoo.clock.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Yearly monthly focus trend item")
public record YearMonthTrendResponse(
        String month,
        String label,
        Long focusCount,
        Long focusMinutes,
        Long focusSeconds,
        Long abandonedCount
) {
}
