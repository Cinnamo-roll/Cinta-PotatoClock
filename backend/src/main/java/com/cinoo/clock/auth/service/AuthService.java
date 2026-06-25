package com.cinoo.clock.auth.service;

import com.cinoo.clock.auth.dto.ChangePasswordRequest;
import com.cinoo.clock.auth.dto.LoginRequest;
import com.cinoo.clock.auth.dto.LoginResponse;
import com.cinoo.clock.auth.dto.RegisterRequest;
import com.cinoo.clock.common.enums.ErrorCode;
import com.cinoo.clock.common.enums.UserRole;
import com.cinoo.clock.common.enums.UserStatus;
import com.cinoo.clock.common.exception.BusinessException;
import com.cinoo.clock.security.JwtService;
import com.cinoo.clock.security.JwtToken;
import com.cinoo.clock.security.TokenBlacklistService;
import com.cinoo.clock.security.SecurityUtils;
import com.cinoo.clock.settings.entity.UserSetting;
import com.cinoo.clock.settings.repository.UserSettingRepository;
import com.cinoo.clock.user.dto.UserResponse;
import com.cinoo.clock.user.entity.User;
import com.cinoo.clock.user.repository.UserRepository;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final UserSettingRepository userSettingRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;
    private final LoginAttemptService loginAttemptService;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BusinessException(ErrorCode.USERNAME_EXISTS);
        }
        if (request.email() != null && !request.email().isBlank() && userRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.EMAIL_EXISTS);
        }

        User user = new User();
        user.setUsername(request.username());
        user.setNickname(request.nickname());
        user.setEmail(blankToNull(request.email()));
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.USER);
        user.setStatus(UserStatus.ACTIVE);
        User saved = userRepository.save(user);
        userSettingRepository.save(UserSetting.defaults(saved.getId()));
        return UserResponse.from(saved);
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        if (loginAttemptService.isBlocked(request.username())) {
            throw new BusinessException(ErrorCode.LOGIN_TOO_MANY_ATTEMPTS);
        }

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> failLogin(request.username()));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash()) || user.getStatus() != UserStatus.ACTIVE) {
            throw failLogin(request.username());
        }

        loginAttemptService.reset(request.username());
        user.setLastLoginAt(LocalDateTime.now());
        JwtToken token = jwtService.generate(user);
        return new LoginResponse(token.token(), "Bearer", token.expiresIn(), UserResponse.from(user));
    }

    @Transactional(readOnly = true)
    public UserResponse me() {
        return UserResponse.from(currentUser());
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BusinessException(ErrorCode.PASSWORD_CONFIRM_NOT_MATCH);
        }
        User user = currentUser();
        if (!passwordEncoder.matches(request.oldPassword(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    }

    public void logout(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        String token = authorizationHeader.substring(7);
        Claims claims = jwtService.parse(token);
        tokenBlacklistService.blacklist(claims.getId(), jwtService.remainingSeconds(token));
    }

    private BusinessException failLogin(String username) {
        loginAttemptService.recordFailure(username);
        return new BusinessException(ErrorCode.INVALID_CREDENTIALS);
    }

    private User currentUser() {
        return userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
