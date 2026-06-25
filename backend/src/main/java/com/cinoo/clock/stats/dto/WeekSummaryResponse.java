package com.cinoo.clock.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;

@Schema(description = "Weekly focus summary")
public record WeekSummaryResponse(
        LocalDate startDate,
        LocalDate endDate,
        Long totalFocusCount,
        Long totalFocusMinutes,
        Long totalFocusSeconds,
        Long abandonedCount,
        LocalDate bestDay,
        Long bestDayFocusMinutes,
        String bestPeriod,
        List<TaskStatsResponse> topTasks,
        List<DistributionStatsResponse> trend,
        String summaryText
) {
}
