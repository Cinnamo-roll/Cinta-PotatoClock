package com.cinoo.clock.common.enums;

import lombok.Getter;

@Getter
public enum ErrorCode {
    SUCCESS(0, "success"),
    PARAM_ERROR(40000, "参数错误"),
    INVALID_CREDENTIALS(40001, "用户名或密码错误"),
    USERNAME_EXISTS(40002, "用户名已存在"),
    EMAIL_EXISTS(40003, "邮箱已存在"),
    PASSWORD_CONFIRM_NOT_MATCH(40004, "两次密码不一致"),
    UNAUTHORIZED(40100, "未登录"),
    TOKEN_INVALID(40101, "Token 无效"),
    TOKEN_EXPIRED(40102, "Token 已过期"),
    TOKEN_LOGGED_OUT(40103, "Token 已退出登录"),
    FORBIDDEN(40300, "无权限"),
    RESOURCE_NOT_FOUND(40400, "资源不存在"),
    TASK_NOT_FOUND(40401, "任务不存在"),
    LOGIN_TOO_MANY_ATTEMPTS(42900, "登录失败次数过多，请稍后再试"),
    SYSTEM_ERROR(50000, "系统错误");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
