package com.cinoo.clock;

import com.cinoo.clock.security.UserPrincipal;
import com.cinoo.clock.user.entity.User;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

public final class TestSecurity {
    private TestSecurity() {
    }

    public static void loginAs(Long userId) {
        User user = new User();
        user.setId(userId);
        user.setUsername("user" + userId);
        user.setPasswordHash("password");
        UserPrincipal principal = new UserPrincipal(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
    }

    public static void clear() {
        SecurityContextHolder.clearContext();
    }
}
