package com.cinoo.clock.task.dto;

import com.cinoo.clock.common.enums.*;
import com.cinoo.clock.task.entity.FocusTask;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "Todo item response")
public record TaskResponse(
        Long id,
        Long userId,
        Long collectionId,
        String collectionName,
        String title,
        String description,
        Integer durationMinutes,
        TimerType timerType,
        TodoCategory category,
        TaskStatus status,
        TaskPriority priority,
        String backgroundStyle,
        Boolean countToStats,
        Integer sortOrder,
        HabitFrequency habitFrequency,
        Integer targetAmount,
        String targetUnit,
        LocalDate targetDeadline,
        LocalDateTime completedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static TaskResponse from(FocusTask task) {
        return from(task, null);
    }

    public static TaskResponse from(FocusTask task, String collectionName) {
        return new TaskResponse(
                task.getId(),
                task.getUserId(),
                task.getCollectionId(),
                collectionName,
                task.getTitle(),
                task.getDescription(),
                task.getDurationMinutes(),
                task.getTimerType(),
                task.getCategory(),
                task.getStatus(),
                task.getPriority(),
                task.getBackgroundStyle(),
                task.getCountToStats(),
                task.getSortOrder(),
                task.getHabitFrequency(),
                task.getTargetAmount(),
                task.getTargetUnit(),
                task.getTargetDeadline(),
                task.getCompletedAt(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
