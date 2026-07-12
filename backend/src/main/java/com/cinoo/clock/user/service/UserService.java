/*
 * Copyright 2026 CintaOvO
 * Licensed under the Apache License, Version 2.0.
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

package com.cinoo.clock.user.service;

import com.cinoo.clock.common.enums.ErrorCode;
import com.cinoo.clock.common.exception.BusinessException;
import com.cinoo.clock.security.SecurityUtils;
import com.cinoo.clock.user.dto.UpdateUserRequest;
import com.cinoo.clock.user.dto.UserResponse;
import com.cinoo.clock.user.entity.User;
import com.cinoo.clock.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserResponse me() {
        return UserResponse.from(currentUser());
    }

    @Transactional
    public UserResponse updateMe(UpdateUserRequest request) {
        User user = currentUser();
        if (request.email() != null && !request.email().isBlank()
                && !request.email().equals(user.getEmail()) && userRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.EMAIL_EXISTS);
        }
        if (request.nickname() != null && !request.nickname().isBlank()) {
            user.setNickname(request.nickname());
        }
        if (request.email() != null) {
            user.setEmail(request.email().isBlank() ? null : request.email());
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl().isBlank() ? null : request.avatarUrl());
        }
        return UserResponse.from(user);
    }

    private User currentUser() {
        return userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
    }
}
