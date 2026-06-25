package com.cinoo.clock.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Checkin hour distribution item")
public record CheckinHourDistributionResponse(
        String label,
        Integer hour,
        Long count
) {
}
