/*
 * Copyright 2026 CintaOvO
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

package com.cinoo.clock.futureplan.service;

import com.cinoo.clock.common.enums.ErrorCode;
import com.cinoo.clock.common.exception.BusinessException;
import com.cinoo.clock.futureplan.dto.FuturePlanCreateRequest;
import com.cinoo.clock.futureplan.dto.FuturePlanResponse;
import com.cinoo.clock.futureplan.dto.FuturePlanUpdateRequest;
import com.cinoo.clock.futureplan.entity.FuturePlan;
import com.cinoo.clock.futureplan.repository.FuturePlanRepository;
import com.cinoo.clock.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FuturePlanService {
    private final FuturePlanRepository futurePlanRepository;

    @Transactional(readOnly = true)
    public List<FuturePlanResponse> list() {
        Long userId = SecurityUtils.currentUserId();
        return futurePlanRepository.findByUserIdAndDeletedFalseOrderByTargetDateAscCreatedAtDesc(userId)
                .stream()
                .map(FuturePlanResponse::from)
                .toList();
    }

    @Transactional
    public FuturePlanResponse create(FuturePlanCreateRequest request) {
        Long userId = SecurityUtils.currentUserId();
        FuturePlan plan = new FuturePlan();
        plan.setUserId(userId);
        plan.setTitle(request.title().trim());
        plan.setNote(blankToNull(request.note()));
        plan.setTargetDate(request.targetDate());
        return FuturePlanResponse.from(futurePlanRepository.save(plan));
    }

    @Transactional(readOnly = true)
    public FuturePlanResponse get(Long id) {
        return FuturePlanResponse.from(findOwned(id));
    }

    @Transactional
    public FuturePlanResponse update(Long id, FuturePlanUpdateRequest request) {
        FuturePlan plan = findOwned(id);
        if (request.title() != null && !request.title().isBlank()) plan.setTitle(request.title().trim());
        if (request.note() != null) plan.setNote(blankToNull(request.note()));
        if (request.targetDate() != null) plan.setTargetDate(request.targetDate());
        return FuturePlanResponse.from(plan);
    }

    @Transactional
    public void delete(Long id) {
        FuturePlan plan = findOwned(id);
        plan.setDeleted(true);
    }

    private FuturePlan findOwned(Long id) {
        return futurePlanRepository.findByIdAndUserIdAndDeletedFalse(id, SecurityUtils.currentUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "未来计划不存在"));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
