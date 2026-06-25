package com.cinoo.clock.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Interruption reason stats item")
public record InterruptionReasonStatsResponse(
        String reason,
        String reasonText,
        Long count,
        Double percent
) {
}
