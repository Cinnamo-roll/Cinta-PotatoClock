package com.cinoo.clock.potato.entity;

import com.cinoo.clock.common.enums.SessionMode;
import com.cinoo.clock.common.enums.TimerType;
import com.cinoo.clock.common.enums.TodoCategory;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "potato_sessions")
public class PotatoSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "task_id")
    private Long taskId;

    @Column(name = "collection_id")
    private Long collectionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "timer_type", nullable = false, length = 20)
    private TimerType timerType = TimerType.countdown;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TodoCategory category = TodoCategory.normal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SessionMode mode;

    @Column(name = "planned_minutes", nullable = false)
    private Integer plannedMinutes;

    @Column(name = "actual_minutes", nullable = false)
    private Integer actualMinutes;

    @Column(name = "actual_seconds", nullable = false)
    private Integer actualSeconds;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at", nullable = false)
    private LocalDateTime endedAt;

    @Column(nullable = false)
    private Boolean completed;

    @Column(nullable = false)
    private Boolean interrupted;

    @Column(name = "interrupt_reason", length = 50)
    private String interruptReason;

    @Column(name = "count_to_stats", nullable = false)
    private Boolean countToStats = true;

    @Column(length = 500)
    private String note;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
