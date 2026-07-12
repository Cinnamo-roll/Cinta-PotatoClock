/*
 * Copyright 2026 CintaOvO
 * Licensed under the Apache License, Version 2.0.
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

package com.cinoo.clock.task.service;

import com.cinoo.clock.collection.entity.TodoCollection;
import com.cinoo.clock.collection.repository.TodoCollectionRepository;
import com.cinoo.clock.common.enums.*;
import com.cinoo.clock.common.exception.BusinessException;
import com.cinoo.clock.security.SecurityUtils;
import com.cinoo.clock.task.dto.*;
import com.cinoo.clock.task.entity.FocusTask;
import com.cinoo.clock.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final TodoCollectionRepository collectionRepository;

    @Transactional(readOnly = true)
    public List<TaskResponse> list(TaskStatus status) {
        Long userId = SecurityUtils.currentUserId();
        List<FocusTask> tasks = status == null
                ? taskRepository.findByUserIdAndDeletedFalseOrderBySortOrderAscCreatedAtDesc(userId)
                : taskRepository.findByUserIdAndStatusAndDeletedFalseOrderBySortOrderAscCreatedAtDesc(userId, status);
        return tasks.stream().map(this::toResponse).toList();
    }

    @Transactional
    public TaskResponse create(TaskCreateRequest request) {
        Long userId = SecurityUtils.currentUserId();
        if (Boolean.TRUE.equals(request.isCurrent())) {
            taskRepository.clearCurrentTask(userId);
        }
        FocusTask task = new FocusTask();
        task.setUserId(userId);
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setCollectionId(ownedCollectionId(request.collectionId(), userId));
        task.setTimerType(request.timerType() == null ? TimerType.countdown : request.timerType());
        task.setDurationMinutes(resolveDuration(request.durationMinutes(), task.getTimerType()));
        task.setCategory(request.category() == null ? TodoCategory.normal : request.category());
        task.setPriority(request.priority() == null ? TaskPriority.medium : request.priority());
        task.setBackgroundStyle(blankToDefault(request.backgroundStyle(), "default"));
        task.setCountToStats(task.getTimerType() != TimerType.none && (request.countToStats() == null || request.countToStats()));
        task.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());
        task.setHabitFrequency(request.habitFrequency());
        task.setTargetAmount(request.targetAmount());
        task.setTargetUnit(blankToNull(request.targetUnit()));
        task.setTargetDeadline(request.targetDeadline());
        task.setCurrent(Boolean.TRUE.equals(request.isCurrent()));
        normalizeTargetRules(task);
        return toResponse(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public TaskResponse get(Long id) {
        return toResponse(findOwned(id));
    }

    @Transactional
    public TaskResponse update(Long id, TaskUpdateRequest request) {
        FocusTask task = findOwned(id);
        if (request.title() != null && !request.title().isBlank()) task.setTitle(request.title().trim());
        if (request.description() != null) task.setDescription(request.description());
        if (Boolean.TRUE.equals(request.clearCollection())) {
            task.setCollectionId(null);
        } else if (request.collectionId() != null) {
            task.setCollectionId(ownedCollectionId(request.collectionId(), task.getUserId()));
        }
        if (request.timerType() != null) task.setTimerType(request.timerType());
        if (request.durationMinutes() != null || request.timerType() != null) {
            task.setDurationMinutes(resolveDuration(request.durationMinutes() == null ? task.getDurationMinutes() : request.durationMinutes(), task.getTimerType()));
        }
        if (request.category() != null) task.setCategory(request.category());
        if (request.priority() != null) task.setPriority(request.priority());
        if (request.backgroundStyle() != null && !request.backgroundStyle().isBlank()) task.setBackgroundStyle(request.backgroundStyle());
        if (request.countToStats() != null) task.setCountToStats(request.countToStats());
        if (request.sortOrder() != null) task.setSortOrder(request.sortOrder());
        if (request.habitFrequency() != null) task.setHabitFrequency(request.habitFrequency());
        if (request.targetAmount() != null) task.setTargetAmount(request.targetAmount());
        if (request.targetUnit() != null) task.setTargetUnit(blankToNull(request.targetUnit()));
        if (request.targetDeadline() != null) task.setTargetDeadline(request.targetDeadline());
        normalizeTargetRules(task);
        return toResponse(task);
    }

    @Transactional
    public TaskResponse updateStatus(Long id, TaskStatusUpdateRequest request) {
        FocusTask task = findOwned(id);
        applyStatus(task, request.status());
        return toResponse(task);
    }

    @Transactional
    public TaskResponse select(Long id) {
        Long userId = SecurityUtils.currentUserId();
        FocusTask task = findOwned(id);
        taskRepository.clearCurrentTask(userId);
        task.setCurrent(true);
        if (task.getStatus() == TaskStatus.todo) {
            task.setStatus(TaskStatus.running);
        }
        return toResponse(task);
    }

    @Transactional
    public TaskResponse updateSort(Long id, TaskSortUpdateRequest request) {
        FocusTask task = findOwned(id);
        task.setSortOrder(request.sortOrder());
        return toResponse(task);
    }

    @Transactional
    public void delete(Long id) {
        FocusTask task = findOwned(id);
        task.setDeleted(true);
        task.setCurrent(false);
    }

    public FocusTask findOwned(Long id) {
        return taskRepository.findByIdAndUserIdAndDeletedFalse(id, SecurityUtils.currentUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.TASK_NOT_FOUND));
    }

    private void applyStatus(FocusTask task, TaskStatus status) {
        task.setStatus(status);
        if (status == TaskStatus.done) {
            task.setCompletedAt(LocalDateTime.now());
            task.setCurrent(false);
        } else if (status == TaskStatus.todo || status == TaskStatus.running || status == TaskStatus.paused) {
            task.setCompletedAt(null);
        } else if (status == TaskStatus.archived) {
            task.setCurrent(false);
        }
    }

    private Long ownedCollectionId(Long collectionId, Long userId) {
        if (collectionId == null) {
            return null;
        }
        if (collectionRepository.findByIdAndUserIdAndDeletedFalse(collectionId, userId).isEmpty()) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "待办集不存在");
        }
        return collectionId;
    }

    private Integer resolveDuration(Integer durationMinutes, TimerType timerType) {
        if (timerType != TimerType.countdown) {
            return 0;
        }
        Integer value = durationMinutes == null ? 25 : durationMinutes;
        if (timerType == TimerType.countdown && (value < 1 || value > 180)) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "倒计时类型必须设置 1 到 180 分钟的时长");
        }
        if (value < 0 || value > 180) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "计时时长需要在 0 到 180 分钟之间");
        }
        return value;
    }

    private void normalizeTargetRules(FocusTask task) {
        if (task.getTimerType() != TimerType.countdown) {
            task.setDurationMinutes(0);
        }
        if (task.getTimerType() == TimerType.none) {
            task.setCountToStats(false);
        }
        if (task.getCategory() == TodoCategory.normal) {
            task.setHabitFrequency(null);
            task.setTargetAmount(null);
            task.setTargetUnit(null);
            task.setTargetDeadline(null);
            return;
        }
        if (task.getTargetAmount() == null || task.getTargetAmount() < 1 || task.getTargetAmount() > 100000) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "计划量需要在 1 到 100000 之间");
        }
        task.setTargetUnit(task.getTimerType() == TimerType.none ? "次" : blankToDefault(task.getTargetUnit(), "分钟"));
        if (!"次".equals(task.getTargetUnit()) && !"分钟".equals(task.getTargetUnit())) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "计划单位只能是分钟或次");
        }
        if (task.getCategory() == TodoCategory.habit) {
            task.setHabitFrequency(task.getHabitFrequency() == null ? HabitFrequency.daily : task.getHabitFrequency());
            task.setTargetDeadline(null);
            return;
        }
        task.setHabitFrequency(null);
        LocalDate deadline = task.getTargetDeadline() == null ? LocalDate.now() : task.getTargetDeadline();
        if (deadline.isBefore(LocalDate.now())) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "截止日期不能早于今天");
        }
        task.setTargetDeadline(deadline);
    }

    private TaskResponse toResponse(FocusTask task) {
        return TaskResponse.from(task, collectionName(task));
    }

    private String collectionName(FocusTask task) {
        if (task.getCollectionId() == null) {
            return null;
        }
        return collectionRepository.findByIdAndUserIdAndDeletedFalse(task.getCollectionId(), task.getUserId())
                .map(TodoCollection::getName)
                .orElse(null);
    }

    private String blankToDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
