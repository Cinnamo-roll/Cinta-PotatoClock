/*
 * Copyright 2026 CintaOvO
 * Licensed under the Apache License, Version 2.0.
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

package com.cinoo.clock.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class JwtAuthenticationFilterTest {

    @Test
    void publicLoginIgnoresStaleAuthorizationHeader() throws Exception {
        JwtService jwtService = mock(JwtService.class);
        var filter = new JwtAuthenticationFilter(jwtService, mock(TokenBlacklistService.class),
                mock(CustomUserDetailsService.class), new ObjectMapper());
        var request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.addHeader("Authorization", "Bearer stale-token");
        var response = new MockHttpServletResponse();
        var chain = mock(jakarta.servlet.FilterChain.class);

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
        verifyNoInteractions(jwtService);
    }

    @Test
    void staleTokenForDeletedUserReturnsTokenInvalidInsteadOfServerError() throws Exception {
        JwtService jwtService = mock(JwtService.class);
        TokenBlacklistService blacklist = mock(TokenBlacklistService.class);
        CustomUserDetailsService users = mock(CustomUserDetailsService.class);
        Claims claims = mock(Claims.class);
        when(jwtService.parse("stale-token")).thenReturn(claims);
        when(claims.getId()).thenReturn("stale-jti");
        when(claims.getSubject()).thenReturn("99");
        when(users.loadUserById(99L)).thenThrow(new UsernameNotFoundException("用户不存在"));
        var filter = new JwtAuthenticationFilter(jwtService, blacklist, users, new ObjectMapper());
        var request = new MockHttpServletRequest("GET", "/api/tasks");
        request.addHeader("Authorization", "Bearer stale-token");
        var response = new MockHttpServletResponse();

        filter.doFilter(request, response, mock(jakarta.servlet.FilterChain.class));

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentAsString()).contains("40101").contains("Token 无效");
    }
}
