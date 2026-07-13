/*
 * Copyright 2026 CintaOvO
 * Licensed under the Apache License, Version 2.0.
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

package com.cinoo.clock.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoginAttemptService {
    private static final int MAX_FAILURES = 5;
    private static final Duration WINDOW = Duration.ofMinutes(5);

    private final StringRedisTemplate redisTemplate;
    private final ConcurrentMap<String, LocalAttempt> localAttempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String username) {
        username = normalizedUsername(username);
        boolean locallyBlocked = isLocallyBlocked(username);
        try {
            String value = redisTemplate.opsForValue().get(key(username));
            return locallyBlocked || (value != null && Integer.parseInt(value) >= MAX_FAILURES);
        } catch (RuntimeException ex) {
            log.warn("Redis login-attempt lookup failed; using local limiter: {}", ex.getMessage());
            return locallyBlocked;
        }
    }

    public void recordFailure(String username) {
        username = normalizedUsername(username);
        try {
            Long count = redisTemplate.opsForValue().increment(key(username));
            if (count != null && count == 1L) {
                redisTemplate.expire(key(username), WINDOW);
            }
        } catch (RuntimeException ex) {
            log.warn("Redis login-attempt update failed; using local limiter: {}", ex.getMessage());
            recordLocalFailure(username);
        }
    }

    public void reset(String username) {
        username = normalizedUsername(username);
        localAttempts.remove(username);
        try {
            redisTemplate.delete(key(username));
        } catch (RuntimeException ex) {
            log.warn("Redis login-attempt reset failed: {}", ex.getMessage());
        }
    }

    private String key(String username) {
        return "login:fail:" + normalizedUsername(username);
    }

    private boolean isLocallyBlocked(String username) {
        LocalAttempt attempt = localAttempts.get(username);
        if (attempt == null) return false;
        if (attempt.expiresAt().isBefore(Instant.now())) {
            localAttempts.remove(username, attempt);
            return false;
        }
        return attempt.count() >= MAX_FAILURES;
    }

    private void recordLocalFailure(String username) {
        Instant now = Instant.now();
        localAttempts.compute(username, (key, current) -> {
            if (current == null || current.expiresAt().isBefore(now)) {
                return new LocalAttempt(1, now.plus(WINDOW));
            }
            return new LocalAttempt(current.count() + 1, current.expiresAt());
        });
    }

    private record LocalAttempt(int count, Instant expiresAt) {
    }

    private String normalizedUsername(String username) {
        return username.trim().toLowerCase(Locale.ROOT);
    }
}
