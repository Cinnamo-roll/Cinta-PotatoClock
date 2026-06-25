package com.cinoo.clock.checkin.repository;

import com.cinoo.clock.checkin.entity.CheckinRecord;
import com.cinoo.clock.common.enums.CheckinType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CheckinRecordRepository extends JpaRepository<CheckinRecord, Long>, JpaSpecificationExecutor<CheckinRecord> {
    Optional<CheckinRecord> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndTypeAndCheckinTimeBetween(Long userId, CheckinType type, LocalDateTime start, LocalDateTime end);

    boolean existsByUserIdAndTypeAndCheckinTimeBetweenAndIdNot(Long userId, CheckinType type, LocalDateTime start, LocalDateTime end, Long id);

    @Query(value = """
            select hour(checkin_time), count(*)
            from checkin_records
            where user_id = :userId and type = :type and checkin_time between :start and :end
            group by hour(checkin_time)
            order by hour(checkin_time)
            """, nativeQuery = true)
    List<Object[]> aggregateByHour(@Param("userId") Long userId,
                                   @Param("type") String type,
                                   @Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end);

    @Query(value = """
            select date(checkin_time), type, count(*)
            from checkin_records
            where user_id = :userId and checkin_time between :start and :end
            group by date(checkin_time), type
            order by date(checkin_time)
            """, nativeQuery = true)
    List<Object[]> aggregateByDateAndType(@Param("userId") Long userId,
                                          @Param("start") LocalDateTime start,
                                          @Param("end") LocalDateTime end);

    @Query(value = """
            select date(checkin_time), min(checkin_time)
            from checkin_records
            where user_id = :userId and type = 'wakeup' and checkin_time between :start and :end
            group by date(checkin_time)
            order by date(checkin_time)
            """, nativeQuery = true)
    List<Object[]> wakeupLine(@Param("userId") Long userId,
                              @Param("start") LocalDateTime start,
                              @Param("end") LocalDateTime end);

    @Query(value = """
            select date(checkin_time), max(checkin_time)
            from checkin_records
            where user_id = :userId and type = 'sleep' and checkin_time between :start and :end
            group by date(checkin_time)
            order by date(checkin_time)
            """, nativeQuery = true)
    List<Object[]> sleepLine(@Param("userId") Long userId,
                             @Param("start") LocalDateTime start,
                             @Param("end") LocalDateTime end);
}
