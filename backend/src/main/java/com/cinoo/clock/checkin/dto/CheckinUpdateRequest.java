package com.cinoo.clock.checkin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Schema(description = "Update checkin request")
public record CheckinUpdateRequest(
        LocalDateTime checkinTime,
        @Size(max = 255) String note
) {
}
