package com.cinoo.clock.settings.entity;

import com.cinoo.clock.common.enums.ThemeMode;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "user_settings")
public class UserSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "focus_minutes", nullable = false)
    private Integer focusMinutes = 25;

    @Column(name = "default_duration_minutes", nullable = false)
    private Integer defaultDurationMinutes = 25;

    @Column(name = "focus_motto", length = 200)
    private String focusMotto;

    @Column(name = "break_minutes", nullable = false)
    private Integer breakMinutes = 5;

    @Column(name = "pause_limit_minutes")
    private Integer pauseLimitMinutes;

    @Column(name = "completion_sound", nullable = false, length = 50)
    private String completionSound = "default";

    @Column(name = "study_mode_enabled", nullable = false)
    private Boolean studyModeEnabled = false;

    @Column(name = "countdown_auto_continue_enabled", nullable = false)
    private Boolean countdownAutoContinueEnabled = false;

    @Column(name = "short_break_minutes", nullable = false)
    private Integer shortBreakMinutes = 5;

    @Column(name = "long_break_minutes", nullable = false)
    private Integer longBreakMinutes = 15;

    @Column(name = "long_break_interval", nullable = false)
    private Integer longBreakInterval = 4;

    @Column(name = "auto_start_break", nullable = false)
    private Boolean autoStartBreak = false;

    @Column(name = "auto_start_focus", nullable = false)
    private Boolean autoStartFocus = false;

    @Column(name = "auto_start_next", nullable = false)
    private Boolean autoStartNext = false;

    @Column(name = "sound_enabled", nullable = false)
    private Boolean soundEnabled = true;

    @Column(name = "vibration_enabled", nullable = false)
    private Boolean vibrationEnabled = true;

    @Column(name = "notification_enabled", nullable = false)
    private Boolean notificationEnabled = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "theme_mode", nullable = false, length = 20)
    private ThemeMode themeMode = ThemeMode.system;

    @Column(name = "theme_color", nullable = false, length = 50)
    private String themeColor = "rose";

    @Column(name = "custom_theme_color", length = 20)
    private String customThemeColor;

    @Column(name = "default_stats_range", nullable = false, length = 20)
    private String defaultStatsRange = "week";

    @Column(name = "week_start_day", nullable = false, length = 20)
    private String weekStartDay = "monday";

    @Column(name = "show_month_stats", nullable = false)
    private Boolean showMonthStats = true;

    @Column(name = "show_interruption_reasons", nullable = false)
    private Boolean showInterruptionReasons = true;

    @Column(name = "show_task_ranking", nullable = false)
    private Boolean showTaskRanking = true;

    @Column(name = "show_checkin_stats", nullable = false)
    private Boolean showCheckinStats = true;

    @Column(name = "show_year_stats", nullable = false)
    private Boolean showYearStats = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public static UserSetting defaults(Long userId) {
        UserSetting setting = new UserSetting();
        setting.setUserId(userId);
        return setting;
    }

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
