package com.cinoo.clock.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

@Schema(description = "更新当前用户资料请求")
public record UpdateUserRequest(
        @Size(max = 50, message = "昵称最多 50 个字符") String nickname,
        @Email(message = "邮箱格式不正确") @Size(max = 120, message = "邮箱最多 120 个字符") String email,
        @Size(max = 500, message = "头像 URL 最多 500 个字符") String avatarUrl
) {
}
