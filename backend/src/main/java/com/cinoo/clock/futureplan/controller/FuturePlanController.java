package com.cinoo.clock.futureplan.controller;

import com.cinoo.clock.common.response.ApiResponse;
import com.cinoo.clock.futureplan.dto.FuturePlanCreateRequest;
import com.cinoo.clock.futureplan.dto.FuturePlanResponse;
import com.cinoo.clock.futureplan.dto.FuturePlanUpdateRequest;
import com.cinoo.clock.futureplan.service.FuturePlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Future Plans", description = "Future countdown plan management")
@RestController
@RequestMapping("/api/future-plans")
@RequiredArgsConstructor
public class FuturePlanController {
    private final FuturePlanService futurePlanService;

    @Operation(summary = "List future plans")
    @GetMapping
    public ApiResponse<List<FuturePlanResponse>> list() {
        return ApiResponse.success(futurePlanService.list());
    }

    @Operation(summary = "Create future plan")
    @PostMapping
    public ApiResponse<FuturePlanResponse> create(@Valid @RequestBody FuturePlanCreateRequest request) {
        return ApiResponse.success(futurePlanService.create(request));
    }

    @Operation(summary = "Get future plan")
    @GetMapping("/{id}")
    public ApiResponse<FuturePlanResponse> get(@PathVariable Long id) {
        return ApiResponse.success(futurePlanService.get(id));
    }

    @Operation(summary = "Update future plan")
    @PutMapping("/{id}")
    public ApiResponse<FuturePlanResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody FuturePlanUpdateRequest request) {
        return ApiResponse.success(futurePlanService.update(id, request));
    }

    @Operation(summary = "Delete future plan")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        futurePlanService.delete(id);
        return ApiResponse.success();
    }
}
