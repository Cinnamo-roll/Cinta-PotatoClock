package com.cinoo.clock.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "注册请求")
public record RegisterRequest(
        @NotBlank(message = "用户名不能为空")
        @Size(min = 3, max = 20, message = "用户名长度需要在 3 到 20 个字符之间")
        @Pattern(regexp = "^[A-Za-z][A-Za-z0-9_]{2,19}$", message = "用户名需以字母开头，只能包含字母、数字和下划线")
        String username,
        @NotBlank(message = "昵称不能为空")
        @Size(min = 1, max = 20, message = "昵称最多 20 个字符")
        String nickname,
        @Email(message = "邮箱格式不正确") @Size(max = 100, message = "邮箱最多 100 个字符") String email,
        @NotBlank(message = "密码不能为空")
        @Size(min = 6, max = 72, message = "密码长度需要在 6 到 72 个字符之间")
        @Pattern(regexp = ".*\\S.*", message = "密码不能全是空格")
        String password
) {
}
