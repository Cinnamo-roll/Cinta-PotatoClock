package com.cinoo.clock.potato.controller;

import com.cinoo.clock.common.response.ApiResponse;
import com.cinoo.clock.potato.dto.PotatoSessionCreateRequest;
import com.cinoo.clock.potato.dto.PotatoSessionPageResponse;
import com.cinoo.clock.potato.dto.PotatoSessionResponse;
import com.cinoo.clock.potato.dto.PotatoSessionUpdateRequest;
import com.cinoo.clock.potato.service.PotatoSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Potato Sessions", description = "Focus session records")
@RestController
@RequestMapping("/api/potato/sessions")
@RequiredArgsConstructor
public class PotatoSessionController {
    private final PotatoSessionService sessionService;

    @Operation(summary = "Create focus session")
    @PostMapping
    public ApiResponse<PotatoSessionResponse> create(@Valid @RequestBody PotatoSessionCreateRequest request) {
        return ApiResponse.success(sessionService.create(request));
    }

    @Operation(summary = "List focus sessions")
    @GetMapping
    public ApiResponse<PotatoSessionPageResponse> list(@RequestParam(required = false) LocalDate startDate,
                                                         @RequestParam(required = false) LocalDate endDate,
                                                         @RequestParam(required = false) String month,
                                                         @RequestParam(required = false) Long taskId,
                                                         @RequestParam(required = false) Long collectionId,
                                                         @RequestParam(required = false) Boolean completed,
                                                         @RequestParam(required = false) Boolean interrupted,
                                                         @RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(sessionService.page(startDate, endDate, month, taskId, collectionId, completed, interrupted, page, size));
    }

    @Operation(summary = "Today focus sessions")
    @GetMapping("/today")
    public ApiResponse<List<PotatoSessionResponse>> today() {
        return ApiResponse.success(sessionService.today());
    }

    @Operation(summary = "Recent focus sessions")
    @GetMapping("/recent")
    public ApiResponse<List<PotatoSessionResponse>> recent(@RequestParam(defaultValue = "20") int limit) {
        return ApiResponse.success(sessionService.recent(limit));
    }

    @Operation(summary = "Update focus session")
    @PatchMapping("/{id}")
    public ApiResponse<PotatoSessionResponse> update(@PathVariable Long id, @Valid @RequestBody PotatoSessionUpdateRequest request) {
        return ApiResponse.success(sessionService.update(id, request));
    }

    @Operation(summary = "Delete focus session")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        sessionService.delete(id);
        return ApiResponse.success();
    }
}
