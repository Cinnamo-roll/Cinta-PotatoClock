package com.cinoo.clock.common.response;

import com.cinoo.clock.common.enums.ErrorCode;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "统一接口响应")
public record ApiResponse<T>(
        @Schema(description = "业务状态码", example = "0") int code,
        @Schema(description = "响应消息", example = "success") String message,
        @Schema(description = "响应数据") T data
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(ErrorCode.SUCCESS.getCode(), ErrorCode.SUCCESS.getMessage(), data);
    }

    public static ApiResponse<Void> success() {
        return new ApiResponse<>(ErrorCode.SUCCESS.getCode(), ErrorCode.SUCCESS.getMessage(), null);
    }

    public static ApiResponse<Void> error(ErrorCode errorCode) {
        return new ApiResponse<>(errorCode.getCode(), errorCode.getMessage(), null);
    }

    public static ApiResponse<Void> error(int code, String message) {
        return new ApiResponse<>(code, message, null);
    }
}
