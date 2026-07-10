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
            where user_id = :userId and type = :type
              and (case
                    when type = 'sleep' and time(checkin_time) < '02:00:00'
                      then date_sub(date(checkin_time), interval 1 day)
                    else date(checkin_time)
                   end) between date(:start) and date(:end)
            group by hour(checkin_time)
            order by hour(checkin_time)
            """, nativeQuery = true)
    List<Object[]> aggregateByHour(@Param("userId") Long userId,
                                   @Param("type") String type,
                                   @Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end);

    @Query(value = """
            select (case
                      when type = 'sleep' and time(checkin_time) < '02:00:00'
                        then date_sub(date(checkin_time), interval 1 day)
                      else date(checkin_time)
                    end) as checkin_date,
                   type,
                   count(*)
            from checkin_records
            where user_id = :userId
              and (case
                    when type = 'sleep' and time(checkin_time) < '02:00:00'
                      then date_sub(date(checkin_time), interval 1 day)
                    else date(checkin_time)
                   end) between date(:start) and date(:end)
            group by checkin_date, type
            order by checkin_date
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
            select (case
                      when time(checkin_time) < '02:00:00'
                        then date_sub(date(checkin_time), interval 1 day)
                      else date(checkin_time)
                    end) as sleep_date,
                   max(checkin_time)
            from checkin_records
            where user_id = :userId and type = 'sleep'
              and (case
                    when time(checkin_time) < '02:00:00'
                      then date_sub(date(checkin_time), interval 1 day)
                    else date(checkin_time)
                   end) between date(:start) and date(:end)
            group by sleep_date
            order by sleep_date
            """, nativeQuery = true)
    List<Object[]> sleepLine(@Param("userId") Long userId,
                             @Param("start") LocalDateTime start,
                             @Param("end") LocalDateTime end);
}
