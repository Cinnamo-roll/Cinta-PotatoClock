package com.cinoo.clock.collection.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

@Schema(description = "Update todo collection request")
public record TodoCollectionUpdateRequest(
        @Size(max = 80, message = "待办集名称最多 80 个字符") String name,
        String description,
        @Size(max = 50, message = "颜色最多 50 个字符") String color,
        Integer sortOrder
) {
}
