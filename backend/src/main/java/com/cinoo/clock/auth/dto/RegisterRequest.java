package com.cinoo.clock.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "注册请求")
public record RegisterRequest(
        @NotBlank(message = "用户名不能为空") @Size(max = 50, message = "用户名最多 50 个字符") String username,
        @NotBlank(message = "昵称不能为空") @Size(max = 50, message = "昵称最多 50 个字符") String nickname,
        @Email(message = "邮箱格式不正确") @Size(max = 120, message = "邮箱最多 120 个字符") String email,
        @NotBlank(message = "密码不能为空") @Size(min = 6, max = 72, message = "密码长度需要在 6 到 72 个字符之间") String password
) {
}
