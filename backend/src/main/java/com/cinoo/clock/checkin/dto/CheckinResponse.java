package com.cinoo.clock.checkin.dto;

import com.cinoo.clock.checkin.entity.CheckinRecord;
import com.cinoo.clock.common.enums.CheckinType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Checkin response")
public record CheckinResponse(
        Long id,
        CheckinType type,
        LocalDateTime checkinTime,
        String note,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static CheckinResponse from(CheckinRecord record) {
        return new CheckinResponse(
                record.getId(),
                record.getType(),
                record.getCheckinTime(),
                record.getNote(),
                record.getCreatedAt(),
                record.getUpdatedAt()
        );
    }
}
