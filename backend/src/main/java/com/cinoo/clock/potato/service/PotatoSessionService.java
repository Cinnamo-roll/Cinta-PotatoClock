/*
 * Copyright 2026 CintaOvO
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

package com.cinoo.clock.potato.service;

import com.cinoo.clock.collection.entity.TodoCollection;
import com.cinoo.clock.collection.repository.TodoCollectionRepository;
import com.cinoo.clock.common.enums.ErrorCode;
import com.cinoo.clock.common.enums.SessionMode;
import com.cinoo.clock.common.enums.TimerType;
import com.cinoo.clock.common.enums.TodoCategory;
import com.cinoo.clock.common.exception.BusinessException;
import com.cinoo.clock.potato.dto.PotatoSessionCreateRequest;
import com.cinoo.clock.potato.dto.PotatoSessionPageResponse;
import com.cinoo.clock.potato.dto.PotatoSessionResponse;
import com.cinoo.clock.potato.dto.PotatoSessionUpdateRequest;
import com.cinoo.clock.potato.entity.PotatoSession;
import com.cinoo.clock.potato.repository.PotatoSessionRepository;
import com.cinoo.clock.security.SecurityUtils;
import com.cinoo.clock.task.entity.FocusTask;
import com.cinoo.clock.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.Duration;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PotatoSessionService {
    private final PotatoSessionRepository sessionRepository;
    private final TaskRepository taskRepository;
    private final TodoCollectionRepository collectionRepository;
    private final StringRedisTemplate redisTemplate;

    @Transactional
    public PotatoSessionResponse create(PotatoSessionCreateRequest request) {
        Long userId = SecurityUtils.currentUserId();
        FocusTask task = null;
        Long taskId = request.resolvedTaskId();
        if (taskId != null) {
            task = taskRepository.findByIdAndUserIdAndDeletedFalse(taskId, userId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.TASK_NOT_FOUND));
        }
        TimerType timerType = request.timerType() == null
                ? (task == null ? TimerType.countdown : task.getTimerType())
                : request.timerType();
        validateCreateRequest(request, timerType);
        TodoCategory category = request.category() == null
                ? (task == null ? TodoCategory.normal : task.getCategory())
                : request.category();
        Long collectionId = request.collectionId() == null
                ? (task == null ? null : task.getCollectionId())
                : request.collectionId();
        if (collectionId != null && collectionRepository.findByIdAndUserIdAndDeletedFalse(collectionId, userId).isEmpty()) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Collection not found");
        }
        boolean interrupted = Boolean.TRUE.equals(request.interrupted());
        boolean completed = Boolean.TRUE.equals(request.completed());
        boolean countToStats = timerType == TimerType.none
                ? false
                : task != null && Boolean.FALSE.equals(task.getCountToStats())
                ? false
                : request.countToStats() == null || Boolean.TRUE.equals(request.countToStats());

        PotatoSession session = new PotatoSession();
        session.setUserId(userId);
        session.setTaskId(taskId);
        session.setCollectionId(collectionId);
        session.setTimerType(timerType);
        session.setCategory(category);
        session.setMode(request.mode() == null ? SessionMode.focus : request.mode());
        session.setPlannedMinutes(request.plannedMinutes() == null ? 0 : request.plannedMinutes());
        session.setActualSeconds(request.actualSeconds());
        session.setActualMinutes(resolveActualMinutes(request.actualMinutes(), request.actualSeconds()));
        session.setStartedAt(request.startedAt());
        session.setEndedAt(request.endedAt());
        session.setCompleted(completed);
        session.setInterrupted(interrupted);
        session.setInterruptReason(interrupted ? blankToNull(request.interruptReason()) : null);
        session.setCountToStats(countToStats);
        session.setNote(request.note());
        PotatoSession saved = sessionRepository.save(session);

        if (task != null && completed && countToStats) {
            task.setCompletedPotatoes(task.getCompletedPotatoes() + 1);
        }
        clearTodayStats(userId, request.startedAt().toLocalDate());
        return PotatoSessionResponse.from(saved, task == null ? null : task.getTitle(), collectionName(userId, collectionId));
    }

    @Transactional(readOnly = true)
    public PotatoSessionPageResponse page(LocalDate startDate,
                                            LocalDate endDate,
                                            String monthValue,
                                            Long taskId,
                                            Long collectionId,
                                            Boolean completed,
                                            Boolean interrupted,
                                            int page,
                                            int size) {
        Long userId = SecurityUtils.currentUserId();
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 500));
        DateRange dateRange = resolveDateRange(startDate, endDate, monthValue);
        Specification<PotatoSession> spec = sessionSpec(userId, dateRange.start(), dateRange.end(), taskId, collectionId, completed, interrupted);
        Page<PotatoSession> result = sessionRepository.findAll(spec, PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "startedAt")));
        List<PotatoSessionResponse> content = result.getContent().stream()
                .map(session -> PotatoSessionResponse.from(session, taskTitle(userId, session.getTaskId()), collectionName(userId, session.getCollectionId())))
                .toList();
        return new PotatoSessionPageResponse(content, safePage, safeSize, result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public List<PotatoSessionResponse> list(LocalDate startDate, LocalDate endDate) {
        Long userId = SecurityUtils.currentUserId();
        LocalDate start = startDate == null ? LocalDate.now().minusDays(30) : startDate;
        LocalDate end = endDate == null ? LocalDate.now() : endDate;
        return sessionRepository.findByUserIdAndStartedAtBetweenOrderByStartedAtDesc(userId, start.atStartOfDay(), end.atTime(LocalTime.MAX))
                .stream()
                .map(session -> PotatoSessionResponse.from(session, taskTitle(userId, session.getTaskId()), collectionName(userId, session.getCollectionId())))
                .toList();
    }

    private Specification<PotatoSession> sessionSpec(Long userId,
                                                       LocalDate startDate,
                                                       LocalDate endDate,
                                                       Long taskId,
                                                       Long collectionId,
                                                       Boolean completed,
                                                       Boolean interrupted) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
            predicates.add(cb.equal(root.get("userId"), userId));
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("startedAt"), startDate.atStartOfDay()));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("startedAt"), endDate.atTime(LocalTime.MAX)));
            }
            if (taskId != null) {
                predicates.add(cb.equal(root.get("taskId"), taskId));
            }
            if (collectionId != null) {
                predicates.add(cb.equal(root.get("collectionId"), collectionId));
            }
            if (completed != null) {
                predicates.add(cb.equal(root.get("completed"), completed));
            }
            if (interrupted != null) {
                predicates.add(cb.equal(root.get("interrupted"), interrupted));
            }
            return cb.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    @Transactional(readOnly = true)
    public List<PotatoSessionResponse> today() {
        return list(LocalDate.now(), LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<PotatoSessionResponse> recent(int limit) {
        Long userId = SecurityUtils.currentUserId();
        int safeLimit = Math.max(1, Math.min(limit, 100));
        return sessionRepository.findByUserIdOrderByStartedAtDesc(userId, PageRequest.of(0, safeLimit))
                .stream()
                .map(session -> PotatoSessionResponse.from(session, taskTitle(userId, session.getTaskId()), collectionName(userId, session.getCollectionId())))
                .toList();
    }

    @Transactional
    public PotatoSessionResponse update(Long id, PotatoSessionUpdateRequest request) {
        Long userId = SecurityUtils.currentUserId();
        PotatoSession session = sessionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        LocalDate oldStatsDate = session.getStartedAt().toLocalDate();
        if (request.startedAt() != null || request.endedAt() != null) {
            LocalDateTime startedAt = request.startedAt() == null ? session.getStartedAt() : request.startedAt();
            LocalDateTime endedAt = request.endedAt() == null ? session.getEndedAt() : request.endedAt();
            applySessionTimeRange(session, startedAt, endedAt);
        } else if (request.actualMinutes() != null) {
            int actualSeconds = request.actualMinutes() * 60;
            session.setActualMinutes(actualSeconds / 60);
            session.setActualSeconds(actualSeconds);
            session.setEndedAt(session.getStartedAt().plusSeconds(actualSeconds));
        }
        if (request.note() != null) {
            session.setNote(blankToNull(request.note()));
        }
        PotatoSession saved = sessionRepository.save(session);
        if (!oldStatsDate.equals(saved.getStartedAt().toLocalDate())) {
            clearTodayStats(userId, oldStatsDate);
        }
        clearTodayStats(userId, saved.getStartedAt().toLocalDate());
        return PotatoSessionResponse.from(saved, taskTitle(userId, saved.getTaskId()), collectionName(userId, saved.getCollectionId()));
    }

    @Transactional
    public void delete(Long id) {
        Long userId = SecurityUtils.currentUserId();
        PotatoSession session = sessionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        rollbackTaskPotatoIfNeeded(userId, session);
        LocalDate statsDate = session.getStartedAt().toLocalDate();
        sessionRepository.delete(session);
        clearTodayStats(userId, statsDate);
    }

    private void validateCreateRequest(PotatoSessionCreateRequest request, TimerType timerType) {
        boolean noTimerCompletion = timerType == TimerType.none && Boolean.TRUE.equals(request.completed());
        if (!noTimerCompletion && request.actualSeconds() < 5) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "Focus sessions shorter than 5 seconds are not recorded");
        }
        if (request.endedAt().isBefore(request.startedAt()) || (!noTimerCompletion && !request.endedAt().isAfter(request.startedAt()))) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "endedAt must be after startedAt");
        }
        long wallClockSeconds = java.time.Duration.between(request.startedAt(), request.endedAt()).getSeconds();
        if (request.actualSeconds() > wallClockSeconds) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "actualSeconds must not exceed the session time range");
        }
        if (Boolean.TRUE.equals(request.completed()) && Boolean.TRUE.equals(request.interrupted())) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "completed and interrupted cannot both be true");
        }
    }

    private String taskTitle(Long userId, Long taskId) {
        if (taskId == null) {
            return null;
        }
        Optional<FocusTask> task = taskRepository.findByIdAndUserIdAndDeletedFalse(taskId, userId);
        return task.map(FocusTask::getTitle).orElse(null);
    }

    private String collectionName(Long userId, Long collectionId) {
        if (collectionId == null) {
            return null;
        }
        return collectionRepository.findByIdAndUserIdAndDeletedFalse(collectionId, userId)
                .map(TodoCollection::getName)
                .orElse(null);
    }

    private Integer resolveActualMinutes(Integer actualMinutes, Integer actualSeconds) {
        if (actualMinutes != null) {
            return actualMinutes;
        }
        return actualSeconds / 60;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private void applySessionTimeRange(PotatoSession session, LocalDateTime startedAt, LocalDateTime endedAt) {
        if (!endedAt.isAfter(startedAt)) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "endedAt must be after startedAt");
        }
        long actualSeconds = Duration.between(startedAt, endedAt).getSeconds();
        if (actualSeconds < 5) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "Focus sessions shorter than 5 seconds are not recorded");
        }
        if (actualSeconds > 86400) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "actualSeconds must be within 24 hours");
        }
        session.setStartedAt(startedAt);
        session.setEndedAt(endedAt);
        session.setActualSeconds((int) actualSeconds);
        session.setActualMinutes((int) (actualSeconds / 60));
    }

    private void rollbackTaskPotatoIfNeeded(Long userId, PotatoSession session) {
        if (!Boolean.TRUE.equals(session.getCompleted()) || !Boolean.TRUE.equals(session.getCountToStats()) || session.getTaskId() == null) {
            return;
        }
        taskRepository.findByIdAndUserIdAndDeletedFalse(session.getTaskId(), userId)
                .ifPresent(task -> task.setCompletedPotatoes(Math.max(0, task.getCompletedPotatoes() - 1)));
    }

    private void clearTodayStats(Long userId, LocalDate date) {
        redisTemplate.delete("stats:today:" + userId + ":" + date);
    }

    private DateRange resolveDateRange(LocalDate startDate, LocalDate endDate, String monthValue) {
        if (monthValue != null && !monthValue.isBlank()) {
            YearMonth month = YearMonth.parse(monthValue);
            return new DateRange(month.atDay(1), month.atEndOfMonth());
        }
        return new DateRange(startDate, endDate);
    }

    private record DateRange(LocalDate start, LocalDate end) {
    }
}
