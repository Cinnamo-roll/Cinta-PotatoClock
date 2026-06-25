package com.cinoo.clock.checkin.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Paged checkin response")
public record CheckinPageResponse(
        List<CheckinResponse> content,
        Integer page,
        Integer size,
        Long totalElements,
        Integer totalPages
) {
}
