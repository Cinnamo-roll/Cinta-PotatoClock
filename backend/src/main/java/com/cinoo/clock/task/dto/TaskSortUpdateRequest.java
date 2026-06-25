package com.cinoo.clock.task.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Update todo sort order request")
public record TaskSortUpdateRequest(
        @NotNull(message = "排序值不能为空") Integer sortOrder
) {
}
