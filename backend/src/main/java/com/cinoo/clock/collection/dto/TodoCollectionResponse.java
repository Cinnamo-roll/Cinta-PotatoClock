package com.cinoo.clock.collection.dto;

import com.cinoo.clock.collection.entity.TodoCollection;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Todo collection response")
public record TodoCollectionResponse(
        Long id,
        String name,
        String description,
        String color,
        Long todoCount,
        Integer sortOrder,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static TodoCollectionResponse from(TodoCollection collection, long todoCount) {
        return new TodoCollectionResponse(
                collection.getId(),
                collection.getName(),
                collection.getDescription(),
                collection.getColor(),
                todoCount,
                collection.getSortOrder(),
                collection.getCreatedAt(),
                collection.getUpdatedAt()
        );
    }
}
