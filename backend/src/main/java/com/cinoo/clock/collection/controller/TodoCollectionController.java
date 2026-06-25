package com.cinoo.clock.collection.controller;

import com.cinoo.clock.collection.dto.TodoCollectionCreateRequest;
import com.cinoo.clock.collection.dto.TodoCollectionResponse;
import com.cinoo.clock.collection.dto.TodoCollectionSortUpdateRequest;
import com.cinoo.clock.collection.dto.TodoCollectionUpdateRequest;
import com.cinoo.clock.collection.service.TodoCollectionService;
import com.cinoo.clock.common.response.ApiResponse;
import com.cinoo.clock.task.dto.TaskResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Collections", description = "Todo collection management")
@RestController
@RequestMapping("/api/collections")
@RequiredArgsConstructor
public class TodoCollectionController {
    private final TodoCollectionService collectionService;

    @Operation(summary = "List todo collections")
    @GetMapping
    public ApiResponse<List<TodoCollectionResponse>> list() {
        return ApiResponse.success(collectionService.list());
    }

    @Operation(summary = "Create todo collection")
    @PostMapping
    public ApiResponse<TodoCollectionResponse> create(@Valid @RequestBody TodoCollectionCreateRequest request) {
        return ApiResponse.success(collectionService.create(request));
    }

    @Operation(summary = "Get todo collection")
    @GetMapping("/{id}")
    public ApiResponse<TodoCollectionResponse> get(@PathVariable Long id) {
        return ApiResponse.success(collectionService.get(id));
    }

    @Operation(summary = "Update todo collection")
    @PutMapping("/{id}")
    public ApiResponse<TodoCollectionResponse> update(@PathVariable Long id,
                                                      @Valid @RequestBody TodoCollectionUpdateRequest request) {
        return ApiResponse.success(collectionService.update(id, request));
    }

    @Operation(summary = "Delete todo collection")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        collectionService.delete(id);
        return ApiResponse.success();
    }

    @Operation(summary = "Update todo collection sort order")
    @PatchMapping("/{id}/sort")
    public ApiResponse<TodoCollectionResponse> updateSort(@PathVariable Long id,
                                                          @Valid @RequestBody TodoCollectionSortUpdateRequest request) {
        return ApiResponse.success(collectionService.updateSort(id, request));
    }

    @Operation(summary = "List todos in collection")
    @GetMapping("/{id}/tasks")
    public ApiResponse<List<TaskResponse>> tasks(@PathVariable Long id) {
        return ApiResponse.success(collectionService.tasks(id));
    }
}
