package com.cinoo.clock.stats.service;

import com.cinoo.clock.checkin.repository.CheckinRecordRepository;
import com.cinoo.clock.common.enums.CheckinType;
import com.cinoo.clock.TestSecurity;
import com.cinoo.clock.common.enums.SessionMode;
import com.cinoo.clock.common.enums.TaskStatus;
import com.cinoo.clock.common.exception.BusinessException;
import com.cinoo.clock.potato.repository.PotatoSessionRepository;
import com.cinoo.clock.potato.service.PotatoSessionService;
import com.cinoo.clock.task.repository.TaskRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class StatsServiceTest {
    @AfterEach
    void tearDown() {
        TestSecurity.clear();
    }

    @Test
    void todayStatsCalculatedFromRepositories() {
        TestSecurity.loginAs(1L);
        PotatoSessionRepository sessionRepository = mock(PotatoSessionRepository.class);
        TaskRepository taskRepository = mock(TaskRepository.class);
        StringRedisTemplate redis = mock(StringRedisTemplate.class);
        @SuppressWarnings("unchecked")
        ValueOperations<String, String> valueOperations = mock(ValueOperations.class);
        when(redis.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);
        LocalDate today = LocalDate.now();
        when(sessionRepository.sumCompletedStatsSeconds(eq(1L), eq(today.atStartOfDay()), eq(today.atTime(LocalTime.MAX)))).thenReturn(3000L);
        when(sessionRepository.countCompletedStats(eq(1L), any(), any())).thenReturn(2L);
        when(sessionRepository.countInterruptedStats(eq(1L), any(), any())).thenReturn(1L);
        StatsService service = new StatsService(sessionRepository, mock(PotatoSessionService.class), mock(CheckinRecordRepository.class),
                redis, new ObjectMapper().registerModule(new JavaTimeModule()));

        var response = service.today();

        assertThat(response.todayFocusMinutes()).isEqualTo(50L);
        assertThat(response.todayFocusSeconds()).isEqualTo(3000L);
        assertThat(response.todayFocusCount()).isEqualTo(2L);
        assertThat(response.todayAbandonedCount()).isEqualTo(1L);
    }

    @Test
    void calendarReturnsEveryDayOfMonth() {
        TestSecurity.loginAs(1L);
        PotatoSessionRepository sessionRepository = mock(PotatoSessionRepository.class);
        StringRedisTemplate redis = mock(StringRedisTemplate.class);
        when(sessionRepository.sumCompletedStatsSeconds(eq(1L), any(), any())).thenReturn(0L);
        when(sessionRepository.countCompletedStats(eq(1L), any(), any())).thenReturn(0L);
        when(sessionRepository.countInterruptedStats(eq(1L), any(), any())).thenReturn(0L);
        StatsService service = new StatsService(sessionRepository, mock(PotatoSessionService.class), mock(CheckinRecordRepository.class),
                redis, new ObjectMapper().registerModule(new JavaTimeModule()));

        var response = service.calendar("2026-06");

        assertThat(response).hasSize(30);
        assertThat(response.getFirst().date()).isEqualTo(LocalDate.of(2026, 6, 1));
        assertThat(response.getFirst().focusSeconds()).isZero();
    }

    @Test
    void periodDistributionReturnsAllHours() {
        TestSecurity.loginAs(1L);
        PotatoSessionRepository sessionRepository = mock(PotatoSessionRepository.class);
        when(sessionRepository.aggregatePeriodDistribution(eq(1L), any(), any()))
                .thenReturn(List.<Object[]>of(new Object[]{9, 2L, 3000L}));
        StatsService service = new StatsService(sessionRepository, mock(PotatoSessionService.class), mock(CheckinRecordRepository.class),
                mock(StringRedisTemplate.class), new ObjectMapper().registerModule(new JavaTimeModule()));

        var response = service.periodDistribution("2026-06");

        assertThat(response).hasSize(24);
        assertThat(response.get(9).hour()).isEqualTo(9);
        assertThat(response.get(9).focusSeconds()).isEqualTo(3000L);
    }

    @Test
    void interruptionReasonsCalculatesPercent() {
        TestSecurity.loginAs(1L);
        PotatoSessionRepository sessionRepository = mock(PotatoSessionRepository.class);
        when(sessionRepository.aggregateInterruptionReasons(eq(1L), any(), any()))
                .thenReturn(List.<Object[]>of(new Object[]{"interrupted", 3L}, new Object[]{"other", 1L}));
        StatsService service = new StatsService(sessionRepository, mock(PotatoSessionService.class), mock(CheckinRecordRepository.class),
                mock(StringRedisTemplate.class), new ObjectMapper().registerModule(new JavaTimeModule()));

        var response = service.interruptionReasons("2026-06");

        assertThat(response).hasSize(2);
        assertThat(response.getFirst().reason()).isEqualTo("interrupted");
        assertThat(response.getFirst().percent()).isEqualTo(75.0);
    }

    @Test
    void groupedDistributionCalculatesPercent() {
        TestSecurity.loginAs(1L);
        PotatoSessionRepository sessionRepository = mock(PotatoSessionRepository.class);
        when(sessionRepository.aggregateByTimerTypeRange(eq(1L), any(), any()))
                .thenReturn(List.<Object[]>of(
                        new Object[]{"countdown", "countdown", 2L, 3000L, 1L},
                        new Object[]{"countup", "countup", 1L, 1000L, 0L}
                ));
        StatsService service = new StatsService(sessionRepository, mock(PotatoSessionService.class), mock(CheckinRecordRepository.class),
                mock(StringRedisTemplate.class), new ObjectMapper().registerModule(new JavaTimeModule()));

        var response = service.distribution("custom", null, null, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 30), "timerType");

        assertThat(response).hasSize(2);
        assertThat(response.getFirst().key()).isEqualTo("timerType_countdown");
        assertThat(response.getFirst().focusSeconds()).isEqualTo(3000L);
        assertThat(response.getFirst().percent()).isEqualTo(75.0);
    }

    @Test
    void groupedDistributionSupportsCategory() {
        TestSecurity.loginAs(1L);
        PotatoSessionRepository sessionRepository = mock(PotatoSessionRepository.class);
        when(sessionRepository.aggregateByCategoryRange(eq(1L), any(), any()))
                .thenReturn(List.<Object[]>of(new Object[]{"habit", "habit", 4L, 2400L, 1L}));
        StatsService service = new StatsService(sessionRepository, mock(PotatoSessionService.class), mock(CheckinRecordRepository.class),
                mock(StringRedisTemplate.class), new ObjectMapper().registerModule(new JavaTimeModule()));

        var response = service.distribution("month", null, "2026-06", null, null, "category");

        assertThat(response).hasSize(1);
        assertThat(response.getFirst().key()).isEqualTo("category_habit");
        assertThat(response.getFirst().percent()).isEqualTo(100.0);
    }

    @Test
    void monthStatsCanBeScopedToCollection() {
        TestSecurity.loginAs(1L);
        PotatoSessionRepository sessionRepository = mock(PotatoSessionRepository.class);
        when(sessionRepository.countCompletedStatsInCollection(eq(1L), eq(7L), any(), any())).thenReturn(2L);
        when(sessionRepository.sumCompletedStatsSecondsInCollection(eq(1L), eq(7L), any(), any())).thenReturn(3000L);
        when(sessionRepository.countInterruptedStatsInCollection(eq(1L), eq(7L), any(), any())).thenReturn(1L);
        when(sessionRepository.findStatsDatesInCollection(1L, 7L)).thenReturn(List.of(java.sql.Date.valueOf("2026-06-02")));
        StatsService service = new StatsService(sessionRepository, mock(PotatoSessionService.class), mock(CheckinRecordRepository.class),
                mock(StringRedisTemplate.class), new ObjectMapper().registerModule(new JavaTimeModule()));

        var response = service.month("2026-06", 7L);

        assertThat(response.focusCount()).isEqualTo(2L);
        assertThat(response.focusSeconds()).isEqualTo(3000L);
        assertThat(response.abandonedCount()).isEqualTo(1L);
        assertThat(response.activeDays()).isEqualTo(1);
        assertThat(response.completionRate()).isEqualTo(66.67);
    }

    @Test
    void todoDistributionCanBeScopedToCollection() {
        TestSecurity.loginAs(1L);
        PotatoSessionRepository sessionRepository = mock(PotatoSessionRepository.class);
        when(sessionRepository.aggregateByTaskRangeInCollection(eq(1L), eq(7L), any(), any(), any()))
                .thenReturn(List.<Object[]>of(new Object[]{10L, "集合里的待办", 2L, 1800L, 1800L, 0L}));
        StatsService service = new StatsService(sessionRepository, mock(PotatoSessionService.class), mock(CheckinRecordRepository.class),
                mock(StringRedisTemplate.class), new ObjectMapper().registerModule(new JavaTimeModule()));

        var response = service.distribution("custom", null, null, LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 30), "todo", 7L);

        assertThat(response).hasSize(1);
        assertThat(response.getFirst().label()).isEqualTo("集合里的待办");
        assertThat(response.getFirst().focusSeconds()).isEqualTo(1800L);
        assertThat(response.getFirst().percent()).isEqualTo(100.0);
    }

    @Test
    void weekSummaryRejectsRangesLongerThanFourteenDays() {
        TestSecurity.loginAs(1L);
        StatsService service = new StatsService(mock(PotatoSessionRepository.class), mock(PotatoSessionService.class), mock(CheckinRecordRepository.class),
                mock(StringRedisTemplate.class), new ObjectMapper().registerModule(new JavaTimeModule()));

        assertThatThrownBy(() -> service.weekSummary(LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 20)))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void weekSummaryReturnsEmptyTrendWhenNoData() {
        TestSecurity.loginAs(1L);
        PotatoSessionRepository sessionRepository = mock(PotatoSessionRepository.class);
        when(sessionRepository.sumCompletedStatsSeconds(eq(1L), any(), any())).thenReturn(0L);
        when(sessionRepository.countCompletedStats(eq(1L), any(), any())).thenReturn(0L);
        when(sessionRepository.countInterruptedStats(eq(1L), any(), any())).thenReturn(0L);
        StatsService service = new StatsService(sessionRepository, mock(PotatoSessionService.class), mock(CheckinRecordRepository.class),
                mock(StringRedisTemplate.class), new ObjectMapper().registerModule(new JavaTimeModule()));

        var response = service.weekSummary(LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 7));

        assertThat(response.totalFocusSeconds()).isZero();
        assertThat(response.trend()).isEmpty();
    }

    @Test
    void checkinStatsFillEmptyHoursAndDays() {
        TestSecurity.loginAs(1L);
        CheckinRecordRepository checkinRepository = mock(CheckinRecordRepository.class);
        when(checkinRepository.aggregateByHour(eq(1L), eq("wakeup"), any(), any()))
                .thenReturn(List.<Object[]>of(new Object[]{7, 2L}));
        when(checkinRepository.aggregateByDateAndType(eq(1L), any(), any()))
                .thenReturn(List.<Object[]>of(
                        new Object[]{java.sql.Date.valueOf("2026-06-02"), "wakeup", 1L},
                        new Object[]{java.sql.Date.valueOf("2026-06-02"), "sleep", 1L}
                ));
        StatsService service = new StatsService(mock(PotatoSessionRepository.class), mock(PotatoSessionService.class), checkinRepository,
                mock(StringRedisTemplate.class), new ObjectMapper().registerModule(new JavaTimeModule()));

        var hours = service.checkinHourDistribution(CheckinType.wakeup, "2026-06");
        var days = service.checkinMonth("2026-06");

        assertThat(hours).hasSize(24);
        assertThat(hours.get(7).count()).isEqualTo(2L);
        assertThat(days).hasSize(30);
        assertThat(days.get(1).totalCount()).isEqualTo(2L);
    }

    @Test
    void checkinLineStatsReturnDateTimePoints() {
        TestSecurity.loginAs(1L);
        CheckinRecordRepository checkinRepository = mock(CheckinRecordRepository.class);
        when(checkinRepository.wakeupLine(eq(1L), any(), any()))
                .thenReturn(List.<Object[]>of(new Object[]{
                        java.sql.Date.valueOf("2026-06-01"),
                        java.sql.Timestamp.valueOf("2026-06-01 07:30:00")
                }));
        when(checkinRepository.sleepLine(eq(1L), any(), any()))
                .thenReturn(List.<Object[]>of(new Object[]{
                        java.sql.Date.valueOf("2026-06-02"),
                        java.sql.Timestamp.valueOf("2026-06-02 00:10:00")
                }));
        StatsService service = new StatsService(mock(PotatoSessionRepository.class), mock(PotatoSessionService.class), checkinRepository,
                mock(StringRedisTemplate.class), new ObjectMapper().registerModule(new JavaTimeModule()));

        var wakeup = service.wakeupLine("2026-06");
        var sleep = service.sleepLine("2026-06");

        assertThat(wakeup.getFirst().date()).isEqualTo(LocalDate.of(2026, 6, 1));
        assertThat(wakeup.getFirst().time()).isEqualTo("07:30");
        assertThat(wakeup.getFirst().minutesOfDay()).isEqualTo(450);
        assertThat(sleep.getFirst().time()).isEqualTo("00:10");
        assertThat(sleep.getFirst().minutesOfDay()).isEqualTo(1450);
    }

    @Test
    void yearStatsIncludeMonthlyTrendAndStreak() {
        TestSecurity.loginAs(1L);
        PotatoSessionRepository sessionRepository = mock(PotatoSessionRepository.class);
        when(sessionRepository.countCompletedStats(eq(1L), any(), any())).thenReturn(0L);
        when(sessionRepository.sumCompletedStatsSeconds(eq(1L), any(), any())).thenReturn(0L);
        when(sessionRepository.countInterruptedStats(eq(1L), any(), any())).thenReturn(0L);
        when(sessionRepository.countCompletedStats(eq(1L), eq(LocalDate.of(2026, 1, 1).atStartOfDay()), eq(LocalDate.of(2026, 12, 31).atTime(LocalTime.MAX)))).thenReturn(3L);
        when(sessionRepository.sumCompletedStatsSeconds(eq(1L), eq(LocalDate.of(2026, 1, 1).atStartOfDay()), eq(LocalDate.of(2026, 12, 31).atTime(LocalTime.MAX)))).thenReturn(3600L);
        when(sessionRepository.countInterruptedStats(eq(1L), eq(LocalDate.of(2026, 1, 1).atStartOfDay()), eq(LocalDate.of(2026, 12, 31).atTime(LocalTime.MAX)))).thenReturn(1L);
        when(sessionRepository.findStatsDates(1L)).thenReturn(List.of(
                java.sql.Date.valueOf("2026-06-01"),
                java.sql.Date.valueOf("2026-06-02"),
                java.sql.Date.valueOf("2026-06-04")
        ));
        StatsService service = new StatsService(sessionRepository, mock(PotatoSessionService.class), mock(CheckinRecordRepository.class),
                mock(StringRedisTemplate.class), new ObjectMapper().registerModule(new JavaTimeModule()));

        var response = service.year(2026);

        assertThat(response.focusSeconds()).isEqualTo(3600L);
        assertThat(response.completionRate()).isEqualTo(75.0);
        assertThat(response.activeDays()).isEqualTo(3);
        assertThat(response.longestStreakDays()).isEqualTo(2);
        assertThat(response.monthlyTrend()).hasSize(12);
        assertThat(response.monthlyTrend().getFirst().label()).isEqualTo("1\u6708");
    }
}
