/*
 * Copyright 2026 CintaOvO
 * Licensed under the Apache License, Version 2.0.
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

package com.cinoo.clock.checkin.service;

import com.cinoo.clock.checkin.dto.CheckinCreateRequest;
import com.cinoo.clock.checkin.dto.CheckinPageResponse;
import com.cinoo.clock.checkin.dto.CheckinResponse;
import com.cinoo.clock.checkin.dto.CheckinUpdateRequest;
import com.cinoo.clock.checkin.entity.CheckinRecord;
import com.cinoo.clock.checkin.repository.CheckinRecordRepository;
import com.cinoo.clock.common.enums.CheckinType;
import com.cinoo.clock.common.enums.ErrorCode;
import com.cinoo.clock.common.exception.BusinessException;
import com.cinoo.clock.security.SecurityUtils;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CheckinService {
    private static final LocalTime WAKEUP_START = LocalTime.of(5, 0);
    private static final LocalTime WAKEUP_END = LocalTime.of(12, 0);
    private static final LocalTime SLEEP_START = LocalTime.of(20, 0);
    private static final LocalTime SLEEP_END = LocalTime.of(2, 0);

    private final CheckinRecordRepository checkinRepository;

    @Transactional
    public CheckinResponse create(CheckinCreateRequest request) {
        Long userId = SecurityUtils.currentUserId();
        validateCheckinTime(request.type(), request.checkinTime());
        CheckinRange range = checkinRange(request.type(), request.checkinTime());
        if (checkinRepository.existsByUserIdAndTypeAndCheckinTimeBetween(userId, request.type(), range.start(), range.end())) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, checkinLabel(request.type()) + "今天已经完成了");
        }

        CheckinRecord record = new CheckinRecord();
        record.setUserId(userId);
        record.setType(request.type());
        record.setCheckinTime(request.checkinTime());
        record.setNote(blankToNull(request.note()));
        return CheckinResponse.from(checkinRepository.save(record));
    }

    @Transactional(readOnly = true)
    public CheckinPageResponse page(CheckinType type, LocalDate startDate, LocalDate endDate, int page, int size) {
        Long userId = SecurityUtils.currentUserId();
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 100));
        Page<CheckinRecord> result = checkinRepository.findAll(
                spec(userId, type, startDate, endDate),
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "checkinTime"))
        );
        return new CheckinPageResponse(
                result.getContent().stream().map(CheckinResponse::from).toList(),
                safePage,
                safeSize,
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Transactional
    public void delete(Long id) {
        Long userId = SecurityUtils.currentUserId();
        CheckinRecord record = checkinRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        checkinRepository.delete(record);
    }

    @Transactional
    public CheckinResponse update(Long id, CheckinUpdateRequest request) {
        Long userId = SecurityUtils.currentUserId();
        CheckinRecord record = checkinRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        if (request.checkinTime() != null) {
            validateCheckinTime(record.getType(), request.checkinTime());
            CheckinRange range = checkinRange(record.getType(), request.checkinTime());
            if (checkinRepository.existsByUserIdAndTypeAndCheckinTimeBetweenAndIdNot(userId, record.getType(), range.start(), range.end(), id)) {
                throw new BusinessException(ErrorCode.PARAM_ERROR, checkinLabel(record.getType()) + "今天已经完成了");
            }
            record.setCheckinTime(request.checkinTime());
        }
        if (request.note() != null) {
            record.setNote(blankToNull(request.note()));
        }
        return CheckinResponse.from(checkinRepository.save(record));
    }

    private Specification<CheckinRecord> spec(Long userId, CheckinType type, LocalDate startDate, LocalDate endDate) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("userId"), userId));
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("checkinTime"), startDate.atStartOfDay()));
            }
            if (endDate != null) {
                predicates.add(cb.lessThan(root.get("checkinTime"), endDate.plusDays(1).atTime(SLEEP_END)));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private void validateCheckinTime(CheckinType type, LocalDateTime checkinTime) {
        LocalTime time = checkinTime.toLocalTime();
        if (type == CheckinType.wakeup && (time.isBefore(WAKEUP_START) || !time.isBefore(WAKEUP_END))) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "起床打卡只能在 05:00-12:00 前完成");
        }
        if (type == CheckinType.sleep && !isSleepWindow(time)) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "睡眠打卡只能在 20:00-次日 02:00 前完成");
        }
    }

    private boolean isSleepWindow(LocalTime time) {
        return !time.isBefore(SLEEP_START) || time.isBefore(SLEEP_END);
    }

    private CheckinRange checkinRange(CheckinType type, LocalDateTime checkinTime) {
        LocalDate date = checkinTime.toLocalDate();
        if (type == CheckinType.sleep) {
            LocalDate sleepDate = checkinTime.toLocalTime().isBefore(SLEEP_END) ? date.minusDays(1) : date;
            return new CheckinRange(sleepDate.atTime(SLEEP_START), sleepDate.plusDays(1).atTime(SLEEP_END).minusNanos(1));
        }
        return new CheckinRange(date.atStartOfDay(), date.atTime(LocalTime.MAX));
    }

    private String checkinLabel(CheckinType type) {
        return switch (type) {
            case wakeup -> "起床打卡";
            case focus_today -> "今日专注打卡";
            case sleep -> "睡眠打卡";
        };
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private record CheckinRange(LocalDateTime start, LocalDateTime end) {
    }
}
