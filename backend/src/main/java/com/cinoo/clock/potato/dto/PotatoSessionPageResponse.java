package com.cinoo.clock.potato.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Paged focus session response")
public record PotatoSessionPageResponse(
        List<PotatoSessionResponse> content,
        Integer page,
        Integer size,
        Long totalElements,
        Integer totalPages
) {
}
