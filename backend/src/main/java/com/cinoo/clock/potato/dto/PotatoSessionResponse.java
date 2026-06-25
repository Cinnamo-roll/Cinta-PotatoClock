package com.cinoo.clock.potato.dto;

import com.cinoo.clock.common.enums.SessionMode;
import com.cinoo.clock.common.enums.TimerType;
import com.cinoo.clock.common.enums.TodoCategory;
import com.cinoo.clock.potato.entity.PotatoSession;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Focus session response")
public record PotatoSessionResponse(
        Long id,
        Long taskId,
        Long todoId,
        String taskTitle,
        Long collectionId,
        String collectionName,
        TimerType timerType,
        TodoCategory category,
        SessionMode mode,
        Integer plannedMinutes,
        Integer actualMinutes,
        Integer actualSeconds,
        LocalDateTime startedAt,
        LocalDateTime endedAt,
        Boolean completed,
        Boolean interrupted,
        String interruptReason,
        String interruptReasonText,
        Boolean countToStats,
        String note,
        LocalDateTime createdAt
) {
    public static PotatoSessionResponse from(PotatoSession session, String taskTitle) {
        return from(session, taskTitle, null);
    }

    public static PotatoSessionResponse from(PotatoSession session, String taskTitle, String collectionName) {
        return new PotatoSessionResponse(
                session.getId(),
                session.getTaskId(),
                session.getTaskId(),
                taskTitle,
                session.getCollectionId(),
                collectionName,
                session.getTimerType(),
                session.getCategory(),
                session.getMode(),
                session.getPlannedMinutes(),
                session.getActualMinutes(),
                session.getActualSeconds(),
                session.getStartedAt(),
                session.getEndedAt(),
                session.getCompleted(),
                session.getInterrupted(),
                session.getInterruptReason(),
                interruptReasonText(session.getInterruptReason()),
                session.getCountToStats(),
                session.getNote(),
                session.getCreatedAt()
        );
    }

    private static String interruptReasonText(String reason) {
        if (reason == null || reason.isBlank()) {
            return null;
        }
        return switch (reason) {
            case "plan_changed" -> "计划有变";
            case "interrupted" -> "被打断";
            case "too_tired" -> "太累了";
            case "not_want" -> "不想做了";
            default -> "其他";
        };
    }
}
