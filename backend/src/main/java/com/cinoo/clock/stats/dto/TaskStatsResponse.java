package com.cinoo.clock.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Task dimension stats")
public record TaskStatsResponse(
        Long taskId,
        Long todoId,
        String taskTitle,
        Long focusCount,
        Long focusMinutes,
        Long focusSeconds,
        Long abandonedCount,
        Double completionRate
) {
}
