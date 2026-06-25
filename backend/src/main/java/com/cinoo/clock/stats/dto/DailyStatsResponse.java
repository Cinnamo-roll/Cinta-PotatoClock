package com.cinoo.clock.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "每日统计")
public record DailyStatsResponse(
        LocalDate date,
        Long focusMinutes,
        Long completedPotatoes,
        Long completedTasks
) {
}
