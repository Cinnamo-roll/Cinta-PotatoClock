package com.cinoo.clock.auth.service;

import org.junit.jupiter.api.Test;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class LoginAttemptServiceTest {

    @Test
    void fallsBackToLocalLimiterWhenRedisIsUnavailable() {
        StringRedisTemplate redis = mock(StringRedisTemplate.class);
        @SuppressWarnings("unchecked")
        ValueOperations<String, String> values = mock(ValueOperations.class);
        when(redis.opsForValue()).thenReturn(values);
        when(values.get(anyString())).thenThrow(new RedisConnectionFailureException("offline"));
        when(values.increment(anyString())).thenThrow(new RedisConnectionFailureException("offline"));
        when(redis.delete(anyString())).thenThrow(new RedisConnectionFailureException("offline"));
        LoginAttemptService service = new LoginAttemptService(redis);

        for (int index = 0; index < 5; index += 1) {
            service.recordFailure("test-user");
        }

        assertThat(service.isBlocked(" TEST-USER ")).isTrue();
        service.reset("Test-User");
        assertThat(service.isBlocked("test-user")).isFalse();
    }
}
