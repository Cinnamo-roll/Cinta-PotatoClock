package com.cinoo.clock.task.dto;

import com.cinoo.clock.common.enums.*;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Schema(description = "Update todo request")
public record TaskUpdateRequest(
        @Size(max = 120, message = "标题最多 120 个字符") String title,
        String description,
        Long collectionId,
        Boolean clearCollection,
        @Min(value = 0, message = "计时时长不能小于 0 分钟") @Max(value = 180, message = "计时时长不能超过 180 分钟") Integer durationMinutes,
        TimerType timerType,
        TodoCategory category,
        TaskPriority priority,
        String backgroundStyle,
        Boolean countToStats,
        Integer sortOrder,
        HabitFrequency habitFrequency,
        Integer targetAmount,
        String targetUnit,
        LocalDate targetDeadline
) {
}
