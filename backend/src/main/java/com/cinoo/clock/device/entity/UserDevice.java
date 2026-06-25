package com.cinoo.clock.device.entity;

import com.cinoo.clock.common.enums.DevicePlatform;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "user_devices",
        uniqueConstraints = @UniqueConstraint(name = "uk_user_devices_user_device", columnNames = {"user_id", "device_id"}))
public class UserDevice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DevicePlatform platform;

    @Column(name = "device_id", nullable = false, length = 120)
    private String deviceId;

    @Column(name = "device_name", length = 120)
    private String deviceName;

    @Column(name = "app_version", length = 50)
    private String appVersion;

    @Column(name = "build_number", length = 50)
    private String buildNumber;

    @Column(name = "push_token", length = 500)
    private String pushToken;

    @Column(name = "last_active_at", nullable = false)
    private LocalDateTime lastActiveAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (lastActiveAt == null) {
            lastActiveAt = now;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
