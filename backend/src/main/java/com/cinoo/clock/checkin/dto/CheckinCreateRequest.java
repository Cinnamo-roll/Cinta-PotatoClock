package com.cinoo.clock.checkin.dto;

import com.cinoo.clock.common.enums.CheckinType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Schema(description = "Create checkin request")
public record CheckinCreateRequest(
        @NotNull CheckinType type,
        @NotNull LocalDateTime checkinTime,
        @Size(max = 255) String note
) {
}
