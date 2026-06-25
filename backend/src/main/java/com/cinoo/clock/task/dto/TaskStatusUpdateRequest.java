package com.cinoo.clock.task.dto;

import com.cinoo.clock.common.enums.TaskStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "更新任务状态请求")
public record TaskStatusUpdateRequest(
        @NotNull(message = "任务状态不能为空") TaskStatus status
) {
}
