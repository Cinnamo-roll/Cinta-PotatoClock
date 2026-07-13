/*
 * Copyright 2026 CintaOvO
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

package com.cinoo.clock.collection.service;

import com.cinoo.clock.collection.dto.*;
import com.cinoo.clock.collection.entity.TodoCollection;
import com.cinoo.clock.collection.repository.TodoCollectionRepository;
import com.cinoo.clock.common.enums.ErrorCode;
import com.cinoo.clock.common.exception.BusinessException;
import com.cinoo.clock.security.SecurityUtils;
import com.cinoo.clock.task.dto.TaskResponse;
import com.cinoo.clock.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TodoCollectionService {
    private final TodoCollectionRepository collectionRepository;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<TodoCollectionResponse> list() {
        Long userId = SecurityUtils.currentUserId();
        return collectionRepository.findByUserIdAndDeletedFalseOrderBySortOrderAscCreatedAtDesc(userId)
                .stream()
                .map(collection -> TodoCollectionResponse.from(collection, taskRepository.countByUserIdAndCollectionIdAndDeletedFalse(userId, collection.getId())))
                .toList();
    }

    @Transactional
    public TodoCollectionResponse create(TodoCollectionCreateRequest request) {
        Long userId = SecurityUtils.currentUserId();
        TodoCollection collection = new TodoCollection();
        collection.setUserId(userId);
        collection.setName(request.name());
        collection.setDescription(request.description());
        collection.setColor(blankToDefault(request.color(), "pink"));
        collection.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());
        return TodoCollectionResponse.from(collectionRepository.save(collection), 0);
    }

    @Transactional(readOnly = true)
    public TodoCollectionResponse get(Long id) {
        Long userId = SecurityUtils.currentUserId();
        TodoCollection collection = findOwned(id, userId);
        return TodoCollectionResponse.from(collection, taskRepository.countByUserIdAndCollectionIdAndDeletedFalse(userId, id));
    }

    @Transactional
    public TodoCollectionResponse update(Long id, TodoCollectionUpdateRequest request) {
        Long userId = SecurityUtils.currentUserId();
        TodoCollection collection = findOwned(id, userId);
        if (request.name() != null && !request.name().isBlank()) collection.setName(request.name());
        if (request.description() != null) collection.setDescription(request.description());
        if (request.color() != null && !request.color().isBlank()) collection.setColor(request.color());
        if (request.sortOrder() != null) collection.setSortOrder(request.sortOrder());
        return TodoCollectionResponse.from(collection, taskRepository.countByUserIdAndCollectionIdAndDeletedFalse(userId, id));
    }

    @Transactional
    public void delete(Long id) {
        Long userId = SecurityUtils.currentUserId();
        TodoCollection collection = findOwned(id, userId);
        taskRepository.clearCollection(userId, id);
        collection.setDeleted(true);
    }

    @Transactional
    public TodoCollectionResponse updateSort(Long id, TodoCollectionSortUpdateRequest request) {
        Long userId = SecurityUtils.currentUserId();
        TodoCollection collection = findOwned(id, userId);
        collection.setSortOrder(request.sortOrder());
        return TodoCollectionResponse.from(collection, taskRepository.countByUserIdAndCollectionIdAndDeletedFalse(userId, id));
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> tasks(Long id) {
        Long userId = SecurityUtils.currentUserId();
        TodoCollection collection = findOwned(id, userId);
        return taskRepository.findByUserIdAndCollectionIdAndDeletedFalseOrderBySortOrderAscCreatedAtDesc(userId, id)
                .stream()
                .map(task -> TaskResponse.from(task, collection.getName()))
                .toList();
    }

    public void ensureOwned(Long collectionId, Long userId) {
        if (collectionId != null && collectionRepository.findByIdAndUserIdAndDeletedFalse(collectionId, userId).isEmpty()) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "待办集不存在");
        }
    }

    private TodoCollection findOwned(Long id, Long userId) {
        return collectionRepository.findByIdAndUserIdAndDeletedFalse(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "待办集不存在"));
    }

    private String blankToDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value;
    }
}
