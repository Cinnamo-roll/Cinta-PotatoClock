package com.cinoo.clock.potato.dto;

import com.cinoo.clock.common.enums.SessionMode;
import com.cinoo.clock.common.enums.TimerType;
import com.cinoo.clock.common.enums.TodoCategory;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Schema(description = "Create focus session request")
public record PotatoSessionCreateRequest(
        Long taskId,
        Long todoId,
        Long collectionId,
        SessionMode mode,
        TimerType timerType,
        TodoCategory category,
        @Min(0) @Max(240) Integer plannedMinutes,
        @Min(0) @Max(240) Integer actualMinutes,
        @NotNull(message = "actualSeconds is required") @Min(0) @Max(86400) Integer actualSeconds,
        @NotNull(message = "startedAt is required") LocalDateTime startedAt,
        @NotNull(message = "endedAt is required") LocalDateTime endedAt,
        @NotNull(message = "completed is required") Boolean completed,
        Boolean interrupted,
        @Size(max = 50, message = "interruptReason max length is 50") String interruptReason,
        Boolean countToStats,
        @Size(max = 500, message = "note max length is 500") String note
) {
    public Long resolvedTaskId() {
        return taskId != null ? taskId : todoId;
    }
}
