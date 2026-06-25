package com.cinoo.clock.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Checkin date-time line chart item")
public record CheckinLineResponse(
        LocalDate date,
        String time,
        Integer minutesOfDay
) {
}
