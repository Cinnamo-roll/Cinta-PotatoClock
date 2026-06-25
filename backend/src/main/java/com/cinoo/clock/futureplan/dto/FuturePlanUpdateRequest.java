package com.cinoo.clock.futureplan.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Schema(description = "Update future plan request")
public record FuturePlanUpdateRequest(
        @Size(max = 120, message = "计划名称最多 120 个字符") String title,
        String note,
        LocalDate targetDate
) {
}
