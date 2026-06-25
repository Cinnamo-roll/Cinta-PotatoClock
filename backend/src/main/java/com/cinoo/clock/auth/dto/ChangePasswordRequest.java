package com.cinoo.clock.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "修改密码请求")
public record ChangePasswordRequest(
        @NotBlank(message = "旧密码不能为空") String oldPassword,
        @NotBlank(message = "新密码不能为空") @Size(min = 6, max = 72, message = "新密码长度需要在 6 到 72 个字符之间") String newPassword,
        @NotBlank(message = "确认密码不能为空") String confirmPassword
) {
}
