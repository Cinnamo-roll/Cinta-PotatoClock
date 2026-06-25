package com.cinoo.clock.potato.repository;

import com.cinoo.clock.common.enums.SessionMode;
import com.cinoo.clock.potato.entity.PotatoSession;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Date;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PotatoSessionRepository extends JpaRepository<PotatoSession, Long>, JpaSpecificationExecutor<PotatoSession> {
    Optional<PotatoSession> findByIdAndUserId(Long id, Long userId);

    List<PotatoSession> findByUserIdAndStartedAtBetweenOrderByStartedAtDesc(Long userId, LocalDateTime start, LocalDateTime end);

    List<PotatoSession> findByUserIdOrderByStartedAtDesc(Long userId, Pageable pageable);

    @Query("""
            select count(p)
            from PotatoSession p
            where p.userId = :userId and p.mode = :mode and p.completed = true and p.countToStats = true and p.actualSeconds >= 5
              and (p.taskId is null or exists (
                    select 1 from FocusTask t
                    where t.id = p.taskId and t.userId = :userId and t.countToStats = true
              ))
              and p.startedAt between :start and :end
            """)
    long countCompletedMode(@Param("userId") Long userId,
                            @Param("mode") SessionMode mode,
                            @Param("start") LocalDateTime start,
                            @Param("end") LocalDateTime end);

    @Query("""
            select t.id, t.title,
                   count(case when p.completed = true then 1 end),
                   coalesce(sum(case when p.completed = true then p.actualSeconds else 0 end), 0),
                   coalesce(sum(case when p.completed = true then p.actualSeconds else 0 end), 0),
                   count(case when p.interrupted = true then 1 end)
            from PotatoSession p join FocusTask t on p.taskId = t.id
            where p.userId = :userId and p.countToStats = true and p.actualSeconds >= 5
              and p.startedAt between :start and :end
              and t.userId = :userId and t.countToStats = true
            group by t.id, t.title
            order by coalesce(sum(case when p.completed = true then p.actualSeconds else 0 end), 0) desc
            """)
    List<Object[]> aggregateByTaskRange(@Param("userId") Long userId,
                                        @Param("start") LocalDateTime start,
                                        @Param("end") LocalDateTime end,
                                        Pageable pageable);

    @Query("""
            select t.id, t.title,
                   count(case when p.completed = true then 1 end),
                   coalesce(sum(case when p.completed = true then p.actualSeconds else 0 end), 0),
                   coalesce(sum(case when p.completed = true then p.actualSeconds else 0 end), 0),
                   count(case when p.interrupted = true then 1 end)
            from PotatoSession p join FocusTask t on p.taskId = t.id
            where p.userId = :userId and p.collectionId = :collectionId and p.countToStats = true and p.actualSeconds >= 5
              and p.startedAt between :start and :end
              and t.userId = :userId and t.countToStats = true
            group by t.id, t.title
            order by coalesce(sum(case when p.completed = true then p.actualSeconds else 0 end), 0) desc
            """)
    List<Object[]> aggregateByTaskRangeInCollection(@Param("userId") Long userId,
                                                    @Param("collectionId") Long collectionId,
                                                    @Param("start") LocalDateTime start,
                                                    @Param("end") LocalDateTime end,
                                                    Pageable pageable);

    @Query("""
            select count(p)
            from PotatoSession p
            where p.userId = :userId and p.completed = true and p.countToStats = true and p.actualSeconds >= 5
              and (p.taskId is null or exists (
                    select 1 from FocusTask t
                    where t.id = p.taskId and t.userId = :userId and t.countToStats = true
              ))
              and p.startedAt between :start and :end
            """)
    long countCompletedStats(@Param("userId") Long userId,
                             @Param("start") LocalDateTime start,
                             @Param("end") LocalDateTime end);

    @Query("""
            select count(p)
            from PotatoSession p
            where p.userId = :userId and p.collectionId = :collectionId and p.completed = true and p.countToStats = true and p.actualSeconds >= 5
              and (p.taskId is null or exists (
                    select 1 from FocusTask t
                    where t.id = p.taskId and t.userId = :userId and t.countToStats = true
              ))
              and p.startedAt between :start and :end
            """)
    long countCompletedStatsInCollection(@Param("userId") Long userId,
                                         @Param("collectionId") Long collectionId,
                                         @Param("start") LocalDateTime start,
                                         @Param("end") LocalDateTime end);

    @Query("""
            select coalesce(sum(p.actualMinutes), 0)
            from PotatoSession p
            where p.userId = :userId and p.completed = true and p.countToStats = true and p.actualSeconds >= 5
              and (p.taskId is null or exists (
                    select 1 from FocusTask t
                    where t.id = p.taskId and t.userId = :userId and t.countToStats = true
              ))
              and p.startedAt between :start and :end
            """)
    Long sumCompletedStatsMinutes(@Param("userId") Long userId,
                                  @Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end);

    @Query("""
            select coalesce(sum(p.actualSeconds), 0)
            from PotatoSession p
            where p.userId = :userId and p.completed = true and p.countToStats = true and p.actualSeconds >= 5
              and (p.taskId is null or exists (
                    select 1 from FocusTask t
                    where t.id = p.taskId and t.userId = :userId and t.countToStats = true
              ))
              and p.startedAt between :start and :end
            """)
    Long sumCompletedStatsSeconds(@Param("userId") Long userId,
                                  @Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end);

    @Query("""
            select coalesce(sum(p.actualSeconds), 0)
            from PotatoSession p
            where p.userId = :userId and p.collectionId = :collectionId and p.completed = true and p.countToStats = true and p.actualSeconds >= 5
              and (p.taskId is null or exists (
                    select 1 from FocusTask t
                    where t.id = p.taskId and t.userId = :userId and t.countToStats = true
              ))
              and p.startedAt between :start and :end
            """)
    Long sumCompletedStatsSecondsInCollection(@Param("userId") Long userId,
                                              @Param("collectionId") Long collectionId,
                                              @Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end);

    @Query("""
            select count(p)
            from PotatoSession p
            where p.userId = :userId and p.interrupted = true and p.countToStats = true and p.actualSeconds >= 5
              and (p.taskId is null or exists (
                    select 1 from FocusTask t
                    where t.id = p.taskId and t.userId = :userId and t.countToStats = true
              ))
              and p.startedAt between :start and :end
            """)
    long countInterruptedStats(@Param("userId") Long userId,
                               @Param("start") LocalDateTime start,
                               @Param("end") LocalDateTime end);

    @Query("""
            select count(p)
            from PotatoSession p
            where p.userId = :userId and p.collectionId = :collectionId and p.interrupted = true and p.countToStats = true and p.actualSeconds >= 5
              and (p.taskId is null or exists (
                    select 1 from FocusTask t
                    where t.id = p.taskId and t.userId = :userId and t.countToStats = true
              ))
              and p.startedAt between :start and :end
            """)
    long countInterruptedStatsInCollection(@Param("userId") Long userId,
                                           @Param("collectionId") Long collectionId,
                                           @Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end);

    @Query(value = """
            select distinct date(p.started_at)
            from potato_sessions p
            left join tasks t on p.task_id = t.id
            where p.user_id = :userId and p.count_to_stats = true and p.actual_seconds >= 5
              and (p.completed = true or p.interrupted = true)
              and (p.task_id is null or (t.user_id = :userId and t.count_to_stats = true))
            order by date(p.started_at) desc
            """, nativeQuery = true)
    List<Date> findStatsDates(@Param("userId") Long userId);

    @Query(value = """
            select distinct date(p.started_at)
            from potato_sessions p
            left join tasks t on p.task_id = t.id
            where p.user_id = :userId and p.collection_id = :collectionId and p.count_to_stats = true and p.actual_seconds >= 5
              and (p.completed = true or p.interrupted = true)
              and (p.task_id is null or (t.user_id = :userId and t.count_to_stats = true))
            order by date(p.started_at) desc
            """, nativeQuery = true)
    List<Date> findStatsDatesInCollection(@Param("userId") Long userId,
                                          @Param("collectionId") Long collectionId);

    @Query(value = """
            select hour(p.started_at) as hour_value,
                   count(case when p.completed = true then 1 end) as focus_count,
                   coalesce(sum(case when p.completed = true then p.actual_seconds else 0 end), 0) as focus_seconds
            from potato_sessions p
            left join tasks t on p.task_id = t.id
            where p.user_id = :userId and p.count_to_stats = true and p.actual_seconds >= 5
              and p.started_at between :start and :end
              and (p.task_id is null or (t.user_id = :userId and t.count_to_stats = true))
            group by hour(p.started_at)
            order by hour(p.started_at)
            """, nativeQuery = true)
    List<Object[]> aggregatePeriodDistribution(@Param("userId") Long userId,
                                               @Param("start") LocalDateTime start,
                                               @Param("end") LocalDateTime end);

    @Query(value = """
            select hour(p.started_at) as hour_value,
                   count(case when p.completed = true then 1 end) as focus_count,
                   coalesce(sum(case when p.completed = true then p.actual_seconds else 0 end), 0) as focus_seconds
            from potato_sessions p
            left join tasks t on p.task_id = t.id
            where p.user_id = :userId and p.collection_id = :collectionId and p.count_to_stats = true and p.actual_seconds >= 5
              and p.started_at between :start and :end
              and (p.task_id is null or (t.user_id = :userId and t.count_to_stats = true))
            group by hour(p.started_at)
            order by hour(p.started_at)
            """, nativeQuery = true)
    List<Object[]> aggregatePeriodDistributionInCollection(@Param("userId") Long userId,
                                                           @Param("collectionId") Long collectionId,
                                                           @Param("start") LocalDateTime start,
                                                           @Param("end") LocalDateTime end);

    @Query(value = """
            select coalesce(nullif(p.interrupt_reason, ''), 'other') as reason,
                   count(*) as reason_count
            from potato_sessions p
            left join tasks t on p.task_id = t.id
            where p.user_id = :userId and p.interrupted = true and p.count_to_stats = true and p.actual_seconds >= 5
              and p.started_at between :start and :end
              and (p.task_id is null or (t.user_id = :userId and t.count_to_stats = true))
            group by coalesce(nullif(p.interrupt_reason, ''), 'other')
            order by reason_count desc
            """, nativeQuery = true)
    List<Object[]> aggregateInterruptionReasons(@Param("userId") Long userId,
                                                @Param("start") LocalDateTime start,
                                                @Param("end") LocalDateTime end);

    @Query(value = """
            select coalesce(nullif(p.interrupt_reason, ''), 'other') as reason,
                   count(*) as reason_count
            from potato_sessions p
            left join tasks t on p.task_id = t.id
            where p.user_id = :userId and p.collection_id = :collectionId and p.interrupted = true and p.count_to_stats = true and p.actual_seconds >= 5
              and p.started_at between :start and :end
              and (p.task_id is null or (t.user_id = :userId and t.count_to_stats = true))
            group by coalesce(nullif(p.interrupt_reason, ''), 'other')
            order by reason_count desc
            """, nativeQuery = true)
    List<Object[]> aggregateInterruptionReasonsInCollection(@Param("userId") Long userId,
                                                            @Param("collectionId") Long collectionId,
                                                            @Param("start") LocalDateTime start,
                                                            @Param("end") LocalDateTime end);

    @Query(value = """
            select coalesce(cast(p.collection_id as char), 'none') as item_key,
                   coalesce(c.name, 'No collection') as item_label,
                   count(case when p.completed = true then 1 end) as focus_count,
                   coalesce(sum(case when p.completed = true then p.actual_seconds else 0 end), 0) as focus_seconds,
                   count(case when p.interrupted = true then 1 end) as abandoned_count
            from potato_sessions p
            left join tasks t on p.task_id = t.id
            left join todo_collections c on p.collection_id = c.id and c.user_id = :userId
            where p.user_id = :userId and p.count_to_stats = true and p.actual_seconds >= 5
              and p.started_at between :start and :end
              and (p.task_id is null or (t.user_id = :userId and t.count_to_stats = true))
            group by p.collection_id, c.name
            order by focus_seconds desc
            """, nativeQuery = true)
    List<Object[]> aggregateByCollectionRange(@Param("userId") Long userId,
                                              @Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end);

    @Query(value = """
            select p.timer_type as item_key,
                   p.timer_type as item_label,
                   count(case when p.completed = true then 1 end) as focus_count,
                   coalesce(sum(case when p.completed = true then p.actual_seconds else 0 end), 0) as focus_seconds,
                   count(case when p.interrupted = true then 1 end) as abandoned_count
            from potato_sessions p
            left join tasks t on p.task_id = t.id
            where p.user_id = :userId and p.count_to_stats = true and p.actual_seconds >= 5
              and p.started_at between :start and :end
              and (p.task_id is null or (t.user_id = :userId and t.count_to_stats = true))
            group by p.timer_type
            order by focus_seconds desc
            """, nativeQuery = true)
    List<Object[]> aggregateByTimerTypeRange(@Param("userId") Long userId,
                                             @Param("start") LocalDateTime start,
                                             @Param("end") LocalDateTime end);

    @Query(value = """
            select case when p.completed = true then 'completed' when p.interrupted = true then 'interrupted' else 'unknown' end as item_key,
                   case when p.completed = true then 'completed' when p.interrupted = true then 'interrupted' else 'unknown' end as item_label,
                   count(case when p.completed = true then 1 end) as focus_count,
                   coalesce(sum(case when p.completed = true then p.actual_seconds else 0 end), 0) as focus_seconds,
                   count(case when p.interrupted = true then 1 end) as abandoned_count
            from potato_sessions p
            left join tasks t on p.task_id = t.id
            where p.user_id = :userId and p.count_to_stats = true and p.actual_seconds >= 5
              and p.started_at between :start and :end
              and (p.task_id is null or (t.user_id = :userId and t.count_to_stats = true))
            group by item_key, item_label
            order by focus_seconds desc
            """, nativeQuery = true)
    List<Object[]> aggregateByStatusRange(@Param("userId") Long userId,
                                          @Param("start") LocalDateTime start,
                                          @Param("end") LocalDateTime end);

    @Query(value = """
            select p.category as item_key,
                   p.category as item_label,
                   count(case when p.completed = true then 1 end) as focus_count,
                   coalesce(sum(case when p.completed = true then p.actual_seconds else 0 end), 0) as focus_seconds,
                   count(case when p.interrupted = true then 1 end) as abandoned_count
            from potato_sessions p
            left join tasks t on p.task_id = t.id
            where p.user_id = :userId and p.count_to_stats = true and p.actual_seconds >= 5
              and p.started_at between :start and :end
              and (p.task_id is null or (t.user_id = :userId and t.count_to_stats = true))
            group by p.category
            order by focus_seconds desc
            """, nativeQuery = true)
    List<Object[]> aggregateByCategoryRange(@Param("userId") Long userId,
                                            @Param("start") LocalDateTime start,
                                            @Param("end") LocalDateTime end);
}
