package com.cinoo.clock.futureplan.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Schema(description = "Create future plan request")
public record FuturePlanCreateRequest(
        @NotBlank(message = "计划名称不能为空") @Size(max = 120, message = "计划名称最多 120 个字符") String title,
        String note,
        @NotNull(message = "计划日期不能为空") LocalDate targetDate
) {
}
