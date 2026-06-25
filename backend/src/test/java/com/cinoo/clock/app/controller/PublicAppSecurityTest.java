package com.cinoo.clock.app.controller;

import com.cinoo.clock.app.dto.AppInfoResponse;
import com.cinoo.clock.app.service.PublicAppService;
import com.cinoo.clock.config.SecurityConfig;
import com.cinoo.clock.security.CustomUserDetailsService;
import com.cinoo.clock.security.JwtService;
import com.cinoo.clock.security.TokenBlacklistService;
import com.cinoo.clock.task.controller.TaskController;
import com.cinoo.clock.task.service.TaskService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {PublicAppController.class, TaskController.class})
@Import(SecurityConfig.class)
class PublicAppSecurityTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PublicAppService publicAppService;

    @MockBean
    private TaskService taskService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void publicAppInfoDoesNotRequireLogin() throws Exception {
        when(publicAppService.info()).thenReturn(new AppInfoResponse(
                "土豆时钟",
                "slogan",
                "description",
                "https://clock.cinoo.xyz",
                "https://clock.cinoo.xyz/privacy",
                "support@clock.cinoo.xyz"));

        mockMvc.perform(get("/api/public/app/info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.appName").value("土豆时钟"));
    }

    @Test
    void businessEndpointsRequireLogin() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(40100));

        verifyNoInteractions(taskService);
    }
}
