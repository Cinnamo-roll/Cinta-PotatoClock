package com.cinoo.clock.task.entity;

import com.cinoo.clock.common.enums.HabitFrequency;
import com.cinoo.clock.common.enums.TaskPriority;
import com.cinoo.clock.common.enums.TaskStatus;
import com.cinoo.clock.common.enums.TimerType;
import com.cinoo.clock.common.enums.TodoCategory;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "tasks")
public class FocusTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "collection_id")
    private Long collectionId;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes = 25;

    @Enumerated(EnumType.STRING)
    @Column(name = "timer_type", nullable = false, length = 20)
    private TimerType timerType = TimerType.countdown;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TodoCategory category = TodoCategory.normal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskStatus status = TaskStatus.todo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskPriority priority = TaskPriority.medium;

    @Column(name = "estimated_potatoes", nullable = false)
    private Integer estimatedPotatoes = 1;

    @Column(name = "completed_potatoes", nullable = false)
    private Integer completedPotatoes = 0;

    @Column(name = "is_current", nullable = false)
    private Boolean current = false;

    @Column(name = "background_style", nullable = false, length = 100)
    private String backgroundStyle = "default";

    @Column(name = "count_to_stats", nullable = false)
    private Boolean countToStats = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "habit_frequency", length = 20)
    private HabitFrequency habitFrequency;

    @Column(name = "target_amount")
    private Integer targetAmount;

    @Column(name = "target_unit", length = 50)
    private String targetUnit;

    @Column(name = "target_deadline")
    private java.time.LocalDate targetDeadline;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(nullable = false)
    private Boolean deleted = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

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
