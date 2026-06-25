package com.cinoo.clock.user.controller;

import com.cinoo.clock.common.response.ApiResponse;
import com.cinoo.clock.user.dto.UpdateUserRequest;
import com.cinoo.clock.user.dto.UserResponse;
import com.cinoo.clock.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "User", description = "用户资料管理")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @Operation(summary = "获取当前用户资料")
    @GetMapping("/me")
    public ApiResponse<UserResponse> me() {
        return ApiResponse.success(userService.me());
    }

    @Operation(summary = "更新当前用户资料")
    @PutMapping("/me")
    public ApiResponse<UserResponse> updateMe(@Valid @RequestBody UpdateUserRequest request) {
        return ApiResponse.success(userService.updateMe(request));
    }
}
