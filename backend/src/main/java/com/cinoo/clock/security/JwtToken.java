package com.cinoo.clock.security;

public record JwtToken(
        String token,
        String jti,
        long expiresIn
) {
}
