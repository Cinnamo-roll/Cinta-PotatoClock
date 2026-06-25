package com.cinoo.clock.auth.service;

import com.cinoo.clock.auth.dto.LoginRequest;
import com.cinoo.clock.auth.dto.RegisterRequest;
import com.cinoo.clock.common.enums.ErrorCode;
import com.cinoo.clock.common.exception.BusinessException;
import com.cinoo.clock.security.JwtService;
import com.cinoo.clock.security.TokenBlacklistService;
import com.cinoo.clock.settings.repository.UserSettingRepository;
import com.cinoo.clock.user.entity.User;
import com.cinoo.clock.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Test
    void registerRejectsDuplicatedUsername() {
        UserRepository userRepository = mock(UserRepository.class);
        when(userRepository.existsByUsername("cinoo")).thenReturn(true);
        AuthService service = new AuthService(userRepository, mock(UserSettingRepository.class),
                new BCryptPasswordEncoder(), mock(JwtService.class), mock(TokenBlacklistService.class), mock(LoginAttemptService.class));

        assertThatThrownBy(() -> service.register(new RegisterRequest("cinoo", "土豆", null, "secret123")))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.USERNAME_EXISTS);
    }

    @Test
    void loginWithWrongPasswordRecordsFailure() {
        UserRepository userRepository = mock(UserRepository.class);
        LoginAttemptService attempts = mock(LoginAttemptService.class);
        User user = new User();
        user.setUsername("cinoo");
        user.setPasswordHash(new BCryptPasswordEncoder().encode("right-password"));
        when(userRepository.findByUsername("cinoo")).thenReturn(Optional.of(user));
        AuthService service = new AuthService(userRepository, mock(UserSettingRepository.class),
                new BCryptPasswordEncoder(), mock(JwtService.class), mock(TokenBlacklistService.class), attempts);

        assertThatThrownBy(() -> service.login(new LoginRequest("cinoo", "wrong-password")))
                .isInstanceOf(BusinessException.class);
        verify(attempts).recordFailure("cinoo");
    }

    @Test
    void loginBlockedWhenFailuresExceedLimit() {
        LoginAttemptService attempts = mock(LoginAttemptService.class);
        when(attempts.isBlocked("cinoo")).thenReturn(true);
        AuthService service = new AuthService(mock(UserRepository.class), mock(UserSettingRepository.class),
                new BCryptPasswordEncoder(), mock(JwtService.class), mock(TokenBlacklistService.class), attempts);

        assertThatThrownBy(() -> service.login(new LoginRequest("cinoo", "secret123")))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.LOGIN_TOO_MANY_ATTEMPTS);
        verify(attempts, never()).recordFailure(any());
    }
}
