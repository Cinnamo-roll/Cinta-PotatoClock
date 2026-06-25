package com.cinoo.clock.collection.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Update todo collection sort order request")
public record TodoCollectionSortUpdateRequest(
        @NotNull(message = "排序值不能为空") Integer sortOrder
) {
}
