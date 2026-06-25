package com.cinoo.clock.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class LoginAttemptService {
    private static final int MAX_FAILURES = 5;
    private static final Duration WINDOW = Duration.ofMinutes(5);

    private final StringRedisTemplate redisTemplate;

    public boolean isBlocked(String username) {
        String value = redisTemplate.opsForValue().get(key(username));
        return value != null && Integer.parseInt(value) >= MAX_FAILURES;
    }

    public void recordFailure(String username) {
        Long count = redisTemplate.opsForValue().increment(key(username));
        if (count != null && count == 1L) {
            redisTemplate.expire(key(username), WINDOW);
        }
    }

    public void reset(String username) {
        redisTemplate.delete(key(username));
    }

    private String key(String username) {
        return "login:fail:" + username;
    }
}
