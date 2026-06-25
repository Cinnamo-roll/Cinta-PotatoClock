package com.cinoo.clock.user.dto;

import com.cinoo.clock.common.enums.UserRole;
import com.cinoo.clock.common.enums.UserStatus;
import com.cinoo.clock.user.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "用户信息")
public record UserResponse(
        Long id,
        String username,
        String email,
        String nickname,
        String avatarUrl,
        UserRole role,
        UserStatus status,
        LocalDateTime lastLoginAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getNickname(),
                user.getAvatarUrl(),
                user.getRole(),
                user.getStatus(),
                user.getLastLoginAt(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
