package com.cinoo.clock.task.controller;

import com.cinoo.clock.common.enums.TaskStatus;
import com.cinoo.clock.common.response.ApiResponse;
import com.cinoo.clock.task.dto.TaskCreateRequest;
import com.cinoo.clock.task.dto.TaskResponse;
import com.cinoo.clock.task.dto.TaskSortUpdateRequest;
import com.cinoo.clock.task.dto.TaskStatusUpdateRequest;
import com.cinoo.clock.task.dto.TaskUpdateRequest;
import com.cinoo.clock.task.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Tasks", description = "Todo management")
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;

    @Operation(summary = "List todos")
    @GetMapping
    public ApiResponse<List<TaskResponse>> list(@RequestParam(required = false) TaskStatus status) {
        return ApiResponse.success(taskService.list(status));
    }

    @Operation(summary = "Create todo")
    @PostMapping
    public ApiResponse<TaskResponse> create(@Valid @RequestBody TaskCreateRequest request) {
        return ApiResponse.success(taskService.create(request));
    }

    @Operation(summary = "Get todo")
    @GetMapping("/{id}")
    public ApiResponse<TaskResponse> get(@PathVariable Long id) {
        return ApiResponse.success(taskService.get(id));
    }

    @Operation(summary = "Update todo")
    @PutMapping("/{id}")
    public ApiResponse<TaskResponse> update(@PathVariable Long id, @Valid @RequestBody TaskUpdateRequest request) {
        return ApiResponse.success(taskService.update(id, request));
    }

    @Operation(summary = "Update todo status")
    @PatchMapping("/{id}/status")
    public ApiResponse<TaskResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody TaskStatusUpdateRequest request) {
        return ApiResponse.success(taskService.updateStatus(id, request));
    }

    @Operation(summary = "Select current todo")
    @PatchMapping("/{id}/select")
    public ApiResponse<TaskResponse> select(@PathVariable Long id) {
        return ApiResponse.success(taskService.select(id));
    }

    @Operation(summary = "Update todo sort order")
    @PatchMapping("/{id}/sort")
    public ApiResponse<TaskResponse> updateSort(@PathVariable Long id, @Valid @RequestBody TaskSortUpdateRequest request) {
        return ApiResponse.success(taskService.updateSort(id, request));
    }

    @Operation(summary = "Delete todo")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        taskService.delete(id);
        return ApiResponse.success();
    }
}
