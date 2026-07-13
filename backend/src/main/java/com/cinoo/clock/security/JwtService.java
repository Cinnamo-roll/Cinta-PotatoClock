/*
 * Copyright 2026 CintaOvO
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

package com.cinoo.clock.security;

import com.cinoo.clock.config.JwtProperties;
import com.cinoo.clock.user.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {
    private final JwtProperties jwtProperties;
    private final SecretKey key;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        this.key = Keys.hmacShaKeyFor(normalizeSecret(jwtProperties.secret()).getBytes(StandardCharsets.UTF_8));
    }

    public JwtToken generate(User user) {
        Instant now = Instant.now();
        String jti = UUID.randomUUID().toString();
        String token = Jwts.builder()
                .id(jti)
                .subject(user.getId().toString())
                .claim("username", user.getUsername())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(jwtProperties.expiresIn())))
                .signWith(key)
                .compact();
        return new JwtToken(token, jti, jwtProperties.expiresIn());
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public long remainingSeconds(String token) {
        Date expiration = parse(token).getExpiration();
        return Math.max(0, (expiration.getTime() - System.currentTimeMillis()) / 1000);
    }

    private String normalizeSecret(String secret) {
        String value = secret == null || secret.isBlank() ? "please_change_this_secret_at_least_32_chars" : secret;
        if (value.length() >= 32) {
            return value;
        }
        return value + "0".repeat(32 - value.length());
    }
}
