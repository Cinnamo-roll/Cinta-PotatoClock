package com.cinoo.clock.futureplan.dto;

import com.cinoo.clock.futureplan.entity.FuturePlan;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "Future plan response")
public record FuturePlanResponse(
        Long id,
        String title,
        String note,
        LocalDate targetDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static FuturePlanResponse from(FuturePlan plan) {
        return new FuturePlanResponse(
                plan.getId(),
                plan.getTitle(),
                plan.getNote(),
                plan.getTargetDate(),
                plan.getCreatedAt(),
                plan.getUpdatedAt()
        );
    }
}
