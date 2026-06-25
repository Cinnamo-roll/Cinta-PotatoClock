package com.cinoo.clock.checkin.controller;

import com.cinoo.clock.checkin.dto.CheckinCreateRequest;
import com.cinoo.clock.checkin.dto.CheckinPageResponse;
import com.cinoo.clock.checkin.dto.CheckinResponse;
import com.cinoo.clock.checkin.dto.CheckinUpdateRequest;
import com.cinoo.clock.checkin.service.CheckinService;
import com.cinoo.clock.common.enums.CheckinType;
import com.cinoo.clock.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Tag(name = "Checkins", description = "Wakeup, today focus, and sleep checkins")
@RestController
@RequestMapping("/api/checkins")
@RequiredArgsConstructor
public class CheckinController {
    private final CheckinService checkinService;

    @Operation(summary = "Create checkin")
    @PostMapping
    public ApiResponse<CheckinResponse> create(@Valid @RequestBody CheckinCreateRequest request) {
        return ApiResponse.success(checkinService.create(request));
    }

    @Operation(summary = "List checkins")
    @GetMapping
    public ApiResponse<CheckinPageResponse> list(@RequestParam(required = false) CheckinType type,
                                                 @RequestParam(required = false) LocalDate startDate,
                                                 @RequestParam(required = false) LocalDate endDate,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(checkinService.page(type, startDate, endDate, page, size));
    }

    @Operation(summary = "Delete checkin")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        checkinService.delete(id);
        return ApiResponse.success();
    }

    @Operation(summary = "Update checkin")
    @PatchMapping("/{id}")
    public ApiResponse<CheckinResponse> update(@PathVariable Long id, @Valid @RequestBody CheckinUpdateRequest request) {
        return ApiResponse.success(checkinService.update(id, request));
    }
}
