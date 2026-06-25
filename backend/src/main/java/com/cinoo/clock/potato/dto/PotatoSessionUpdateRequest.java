package com.cinoo.clock.potato.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Schema(description = "Update focus session request")
public record PotatoSessionUpdateRequest(
        @Min(1) @Max(1440) Integer actualMinutes,
        LocalDateTime startedAt,
        LocalDateTime endedAt,
        @Size(max = 500, message = "note max length is 500") String note
) {
}
