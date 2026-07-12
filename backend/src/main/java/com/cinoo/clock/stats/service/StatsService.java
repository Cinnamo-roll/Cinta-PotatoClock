/*
 * Copyright 2026 CintaOvO
 * Licensed under the Apache License, Version 2.0.
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

package com.cinoo.clock.stats.service;

import com.cinoo.clock.checkin.repository.CheckinRecordRepository;
import com.cinoo.clock.common.enums.CheckinType;
import com.cinoo.clock.common.enums.ErrorCode;
import com.cinoo.clock.common.exception.BusinessException;
import com.cinoo.clock.potato.dto.PotatoSessionResponse;
import com.cinoo.clock.potato.repository.PotatoSessionRepository;
import com.cinoo.clock.potato.service.PotatoSessionService;
import com.cinoo.clock.security.SecurityUtils;
import com.cinoo.clock.stats.dto.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StatsService {
    private final PotatoSessionRepository sessionRepository;
    private final PotatoSessionService sessionService;
    private final CheckinRecordRepository checkinRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Transactional(readOnly = true)
    public TodayStatsResponse today() {
        return today(null);
    }

    @Transactional(readOnly = true)
    public TodayStatsResponse today(Long collectionId) {
        Long userId = SecurityUtils.currentUserId();
        LocalDate today = LocalDate.now();
        if (collectionId != null) {
            return new TodayStatsResponse(
                    focusCount(userId, today, today, collectionId),
                    focusMinutes(userId, today, today, collectionId),
                    focusSeconds(userId, today, today, collectionId),
                    abandonedCount(userId, today, today, collectionId)
            );
        }
        String cacheKey = todayCacheKey(userId, today);
        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            try {
                return objectMapper.readValue(cached, TodayStatsResponse.class);
            } catch (JsonProcessingException ignored) {
                redisTemplate.delete(cacheKey);
            }
        }
        TodayStatsResponse response = new TodayStatsResponse(
                focusCount(userId, today, today),
                focusMinutes(userId, today, today),
                focusSeconds(userId, today, today),
                abandonedCount(userId, today, today)
        );
        try {
            redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(response), Duration.ofMinutes(10));
        } catch (JsonProcessingException ignored) {
            redisTemplate.delete(cacheKey);
        }
        return response;
    }

    @Transactional(readOnly = true)
    public List<DailyStatsResponse> week() {
        return week(null);
    }

    @Transactional(readOnly = true)
    public List<DailyStatsResponse> week(Long collectionId) {
        Long userId = SecurityUtils.currentUserId();
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(6);
        List<DailyStatsResponse> result = new ArrayList<>();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            result.add(new DailyStatsResponse(date, focusMinutes(userId, date, date, collectionId), focusCount(userId, date, date, collectionId), 0L));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public MonthStatsResponse month(String monthValue) {
        return month(monthValue, null);
    }

    @Transactional(readOnly = true)
    public MonthStatsResponse month(String monthValue, Long collectionId) {
        Long userId = SecurityUtils.currentUserId();
        YearMonth month = monthValue == null || monthValue.isBlank() ? YearMonth.now() : YearMonth.parse(monthValue);
        LocalDate start = month.atDay(1);
        LocalDate end = month.atEndOfMonth();
        long completed = focusCount(userId, start, end, collectionId);
        long abandoned = abandonedCount(userId, start, end, collectionId);
        return new MonthStatsResponse(
                month.toString(),
                completed,
                focusMinutes(userId, start, end, collectionId),
                focusSeconds(userId, start, end, collectionId),
                abandoned,
                completionRate(completed, abandoned),
                activeDaysInRange(userId, start, end, collectionId)
        );
    }

    @Transactional(readOnly = true)
    public SummaryStatsResponse summary() {
        return summary(null);
    }

    @Transactional(readOnly = true)
    public SummaryStatsResponse summary(Long collectionId) {
        Long userId = SecurityUtils.currentUserId();
        LocalDate start = LocalDate.of(1970, 1, 1);
        LocalDate end = LocalDate.now();
        long totalSeconds = focusSeconds(userId, start, end, collectionId);
        int activeDays = statsDateSet(userId, collectionId).size();
        long averageSeconds = activeDays == 0 ? 0 : Math.round((double) totalSeconds / activeDays);
        return new SummaryStatsResponse(
                focusCount(userId, start, end, collectionId),
                totalSeconds / 60,
                totalSeconds,
                averageSeconds / 60,
                averageSeconds,
                abandonedCount(userId, start, end, collectionId)
        );
    }

    @Transactional(readOnly = true)
    public List<DistributionStatsResponse> distribution(String range, LocalDate date, String monthValue, LocalDate startDate, LocalDate endDate, String groupBy) {
        return distribution(range, date, monthValue, startDate, endDate, groupBy, null);
    }

    @Transactional(readOnly = true)
    public List<DistributionStatsResponse> distribution(String range, LocalDate date, String monthValue, LocalDate startDate, LocalDate endDate, String groupBy, Long collectionId) {
        Long userId = SecurityUtils.currentUserId();
        if (groupBy != null && !groupBy.isBlank()) {
            DateRange dateRange = resolveDateRange(range, date, monthValue, startDate, endDate);
            return groupedDistribution(userId, groupBy.trim(), dateRange.start(), dateRange.end(), collectionId);
        }
        String normalized = range == null || range.isBlank() ? "day" : range;
        return switch (normalized) {
            case "week" -> dailyDistribution(
                    userId,
                    startDate == null ? LocalDate.now().minusDays(6) : startDate,
                    endDate == null ? LocalDate.now() : endDate,
                    "MM-dd",
                    collectionId
            );
            case "month" -> {
                YearMonth month = monthValue == null || monthValue.isBlank() ? YearMonth.now() : YearMonth.parse(monthValue);
                yield dailyDistribution(userId, month.atDay(1), month.atEndOfMonth(), "dd", collectionId);
            }
            case "custom" -> dailyDistribution(
                    userId,
                    startDate == null ? LocalDate.now() : startDate,
                    endDate == null ? LocalDate.now() : endDate,
                    "yyyy-MM-dd",
                    collectionId
            );
            default -> hourlyDistribution(userId, date == null ? LocalDate.now() : date, collectionId);
        };
    }

    @Transactional(readOnly = true)
    public List<CalendarStatsResponse> calendar(String monthValue) {
        return calendar(monthValue, null);
    }

    @Transactional(readOnly = true)
    public List<CalendarStatsResponse> calendar(String monthValue, Long collectionId) {
        Long userId = SecurityUtils.currentUserId();
        YearMonth month = monthValue == null || monthValue.isBlank() ? YearMonth.now() : YearMonth.parse(monthValue);
        List<CalendarStatsResponse> result = new ArrayList<>();
        for (LocalDate date = month.atDay(1); !date.isAfter(month.atEndOfMonth()); date = date.plusDays(1)) {
            long seconds = focusSeconds(userId, date, date, collectionId);
            result.add(new CalendarStatsResponse(date, focusCount(userId, date, date, collectionId), seconds / 60, seconds, abandonedCount(userId, date, date, collectionId)));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public WeekSummaryResponse weekSummary(LocalDate startDate, LocalDate endDate) {
        return weekSummary(startDate, endDate, null);
    }

    @Transactional(readOnly = true)
    public WeekSummaryResponse weekSummary(LocalDate startDate, LocalDate endDate, Long collectionId) {
        Long userId = SecurityUtils.currentUserId();
        LocalDate end = endDate == null ? LocalDate.now() : endDate;
        LocalDate start = startDate == null ? end.minusDays(6) : startDate;
        if (start.isAfter(end)) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "startDate must not be after endDate");
        }
        if (ChronoUnit.DAYS.between(start, end) > 14) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "week-summary date range must not exceed 14 days");
        }
        long totalSeconds = focusSeconds(userId, start, end, collectionId);
        long totalFocusCount = focusCount(userId, start, end, collectionId);
        long abandoned = abandonedCount(userId, start, end, collectionId);
        if (totalFocusCount == 0 && abandoned == 0) {
            return new WeekSummaryResponse(
                    start,
                    end,
                    0L,
                    0L,
                    0L,
                    0L,
                    null,
                    0L,
                    null,
                    List.of(),
                    List.of(),
                    "This week has no focus records yet. Start with one small goal."
            );
        }
        List<DistributionStatsResponse> trend = dailyDistribution(userId, start, end, "MM-dd", collectionId);
        DistributionStatsResponse best = trend.stream()
                .max(Comparator.comparingLong(DistributionStatsResponse::focusSeconds))
                .orElse(null);
        String bestPeriod = periodDistribution(start, end, collectionId).stream()
                .max(Comparator.comparingLong(PeriodDistributionResponse::focusSeconds))
                .filter(item -> item.focusSeconds() > 0)
                .map(item -> String.format("%02d:00-%02d:00", item.hour(), Math.min(item.hour() + 1, 24)))
                .orElse(null);
        return new WeekSummaryResponse(
                start,
                end,
                totalFocusCount,
                totalSeconds / 60,
                totalSeconds,
                abandoned,
                best == null || best.focusSeconds() == 0 ? null : best.date(),
                best == null ? 0L : best.focusMinutes(),
                bestPeriod,
                taskStats(start, end, 5, collectionId),
                trend,
                totalSeconds == 0
                        ? "This week has no focus records yet. Start with one small goal."
                        : "Your best focus day this week was " + best.date() + ". Keep a steady rhythm."
        );
    }

    @Transactional(readOnly = true)
    public List<PeriodDistributionResponse> periodDistribution(String monthValue) {
        return periodDistribution(monthValue, null);
    }

    @Transactional(readOnly = true)
    public List<PeriodDistributionResponse> periodDistribution(String monthValue, Long collectionId) {
        YearMonth month = monthValue == null || monthValue.isBlank() ? YearMonth.now() : YearMonth.parse(monthValue);
        return periodDistribution(month.atDay(1), month.atEndOfMonth(), collectionId);
    }

    @Transactional(readOnly = true)
    public List<CheckinHourDistributionResponse> checkinHourDistribution(CheckinType type, String monthValue) {
        Long userId = SecurityUtils.currentUserId();
        YearMonth month = monthValue == null || monthValue.isBlank() ? YearMonth.now() : YearMonth.parse(monthValue);
        Map<Integer, Long> byHour = new HashMap<>();
        for (Object[] row : checkinRepository.aggregateByHour(userId, type.name(), startOf(month.atDay(1)), endOf(month.atEndOfMonth()))) {
            byHour.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        }
        List<CheckinHourDistributionResponse> result = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            result.add(new CheckinHourDistributionResponse(String.format("%02d:00", hour), hour, byHour.getOrDefault(hour, 0L)));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<CheckinMonthStatsResponse> checkinMonth(String monthValue) {
        Long userId = SecurityUtils.currentUserId();
        YearMonth month = monthValue == null || monthValue.isBlank() ? YearMonth.now() : YearMonth.parse(monthValue);
        Map<LocalDate, long[]> byDate = new HashMap<>();
        for (Object[] row : checkinRepository.aggregateByDateAndType(userId, startOf(month.atDay(1)), endOf(month.atEndOfMonth()))) {
            LocalDate date = toLocalDate(row[0]);
            String type = String.valueOf(row[1]);
            long count = ((Number) row[2]).longValue();
            long[] counts = byDate.computeIfAbsent(date, ignored -> new long[2]);
            if (CheckinType.wakeup.name().equals(type)) {
                counts[0] = count;
            } else if (CheckinType.sleep.name().equals(type)) {
                counts[1] = count;
            }
        }
        List<CheckinMonthStatsResponse> result = new ArrayList<>();
        for (LocalDate date = month.atDay(1); !date.isAfter(month.atEndOfMonth()); date = date.plusDays(1)) {
            long[] counts = byDate.getOrDefault(date, new long[2]);
            result.add(new CheckinMonthStatsResponse(date, counts[0], counts[1], counts[0] + counts[1]));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<CheckinLineResponse> wakeupLine(String monthValue) {
        Long userId = SecurityUtils.currentUserId();
        YearMonth month = monthValue == null || monthValue.isBlank() ? YearMonth.now() : YearMonth.parse(monthValue);
        return checkinRepository.wakeupLine(userId, startOf(month.atDay(1)), endOf(month.atEndOfMonth())).stream()
                .map(row -> checkinLineItem(row, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CheckinLineResponse> sleepLine(String monthValue) {
        Long userId = SecurityUtils.currentUserId();
        YearMonth month = monthValue == null || monthValue.isBlank() ? YearMonth.now() : YearMonth.parse(monthValue);
        return checkinRepository.sleepLine(userId, startOf(month.atDay(1)), endOf(month.atEndOfMonth())).stream()
                .map(row -> checkinLineItem(row, true))
                .toList();
    }

    @Transactional(readOnly = true)
    public YearStatsResponse year(Integer yearValue) {
        return year(yearValue, null);
    }

    @Transactional(readOnly = true)
    public YearStatsResponse year(Integer yearValue, Long collectionId) {
        Long userId = SecurityUtils.currentUserId();
        int year = yearValue == null ? Year.now().getValue() : yearValue;
        LocalDate start = LocalDate.of(year, 1, 1);
        LocalDate end = LocalDate.of(year, 12, 31);
        long completed = focusCount(userId, start, end, collectionId);
        long seconds = focusSeconds(userId, start, end, collectionId);
        long abandoned = abandonedCount(userId, start, end, collectionId);
        List<YearMonthTrendResponse> monthlyTrend = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            YearMonth yearMonth = YearMonth.of(year, month);
            LocalDate monthStart = yearMonth.atDay(1);
            LocalDate monthEnd = yearMonth.atEndOfMonth();
            long monthSeconds = focusSeconds(userId, monthStart, monthEnd, collectionId);
            monthlyTrend.add(new YearMonthTrendResponse(
                    yearMonth.toString(),
                    month + "\u6708",
                    focusCount(userId, monthStart, monthEnd, collectionId),
                    monthSeconds / 60,
                    monthSeconds,
                    abandonedCount(userId, monthStart, monthEnd, collectionId)
            ));
        }
        return new YearStatsResponse(
                year,
                completed,
                seconds / 60,
                seconds,
                abandoned,
                completionRate(completed, abandoned),
                activeDaysInRange(userId, start, end, collectionId),
                longestStreakDays(userId, start, end, collectionId),
                monthlyTrend
        );
    }

    @Transactional(readOnly = true)
    public List<InterruptionReasonStatsResponse> interruptionReasons(String monthValue) {
        return interruptionReasons(monthValue, null);
    }

    @Transactional(readOnly = true)
    public List<InterruptionReasonStatsResponse> interruptionReasons(String monthValue, Long collectionId) {
        Long userId = SecurityUtils.currentUserId();
        YearMonth month = monthValue == null || monthValue.isBlank() ? YearMonth.now() : YearMonth.parse(monthValue);
        List<Object[]> rows = collectionId == null
                ? sessionRepository.aggregateInterruptionReasons(userId, startOf(month.atDay(1)), endOf(month.atEndOfMonth()))
                : sessionRepository.aggregateInterruptionReasonsInCollection(userId, collectionId, startOf(month.atDay(1)), endOf(month.atEndOfMonth()));
        long total = rows.stream().mapToLong(row -> ((Number) row[1]).longValue()).sum();
        if (total == 0) {
            return List.of();
        }
        return rows.stream()
                .map(row -> {
                    String reason = (String) row[0];
                    long count = ((Number) row[1]).longValue();
                    return new InterruptionReasonStatsResponse(reason, interruptReasonText(reason), count, Math.round(count * 10000.0 / total) / 100.0);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TaskStatsResponse> taskStats(LocalDate startDate, LocalDate endDate, int limit) {
        return taskStats(startDate, endDate, limit, null);
    }

    @Transactional(readOnly = true)
    public List<TaskStatsResponse> taskStats(LocalDate startDate, LocalDate endDate, int limit, Long collectionId) {
        Long userId = SecurityUtils.currentUserId();
        int safeLimit = Math.max(1, Math.min(limit, 100));
        LocalDate start = startDate == null ? LocalDate.of(1970, 1, 1) : startDate;
        LocalDate end = endDate == null ? LocalDate.now() : endDate;
        List<Object[]> rows = collectionId == null
                ? sessionRepository.aggregateByTaskRange(userId, startOf(start), endOf(end), PageRequest.of(0, safeLimit))
                : sessionRepository.aggregateByTaskRangeInCollection(userId, collectionId, startOf(start), endOf(end), PageRequest.of(0, safeLimit));
        return rowsToTaskStats(rows);
    }

    @Transactional(readOnly = true)
    public List<TaskStatsResponse> taskStats() {
        return taskStats(null, null, 10);
    }

    @Transactional(readOnly = true)
    public List<PotatoSessionResponse> recentSessions(int limit) {
        return recentSessions(limit, null);
    }

    @Transactional(readOnly = true)
    public List<PotatoSessionResponse> recentSessions(int limit, Long collectionId) {
        if (collectionId == null) {
            return sessionService.recent(limit);
        }
        return sessionService.page(null, null, null, null, collectionId, null, null, 0, limit).content();
    }

    private List<TaskStatsResponse> rowsToTaskStats(List<Object[]> rows) {
        return rows.stream()
                .map(row -> {
                    long completed = ((Number) row[2]).longValue();
                    long seconds = ((Number) row[4]).longValue();
                    long abandoned = ((Number) row[5]).longValue();
                    Long taskId = ((Number) row[0]).longValue();
                    return new TaskStatsResponse(taskId, taskId, (String) row[1], completed, seconds / 60, seconds, abandoned, completionRate(completed, abandoned));
                })
                .toList();
    }

    private List<DistributionStatsResponse> groupedDistribution(Long userId, String groupBy, LocalDate start, LocalDate end, Long collectionId) {
        return switch (groupBy) {
            case "period" -> periodDistribution(start, end, collectionId).stream()
                    .map(item -> new DistributionStatsResponse(
                            item.label(),
                            String.valueOf(item.hour()),
                            null,
                            item.focusCount(),
                            item.focusMinutes(),
                            item.focusSeconds(),
                            0L,
                            0.0
                    ))
                    .collect(java.util.stream.Collectors.collectingAndThen(java.util.stream.Collectors.toList(), this::withPercent));
            case "task", "todo" -> taskStats(start, end, 100, collectionId).stream()
                    .map(item -> dimensionItem(item.taskTitle(), "task_" + item.taskId(), item.focusCount(), item.focusSeconds(), item.abandonedCount(), 0L))
                    .collect(java.util.stream.Collectors.collectingAndThen(java.util.stream.Collectors.toList(), this::withPercent));
            case "collection" -> rowsToDimensionStats(sessionRepository.aggregateByCollectionRange(userId, startOf(start), endOf(end)), "collection");
            case "timerType" -> rowsToDimensionStats(sessionRepository.aggregateByTimerTypeRange(userId, startOf(start), endOf(end)), "timerType");
            case "status" -> rowsToDimensionStats(sessionRepository.aggregateByStatusRange(userId, startOf(start), endOf(end)), "status");
            case "category" -> rowsToDimensionStats(sessionRepository.aggregateByCategoryRange(userId, startOf(start), endOf(end)), "category");
            default -> dailyDistribution(userId, start, end, "yyyy-MM-dd");
        };
    }

    private List<DistributionStatsResponse> rowsToDimensionStats(List<Object[]> rows, String keyPrefix) {
        List<DistributionStatsResponse> items = rows.stream()
                .map(row -> {
                    String key = keyPrefix + "_" + String.valueOf(row[0]);
                    String label = String.valueOf(row[1]);
                    long focusCount = ((Number) row[2]).longValue();
                    long focusSeconds = ((Number) row[3]).longValue();
                    long abandonedCount = ((Number) row[4]).longValue();
                    return dimensionItem(label, key, focusCount, focusSeconds, abandonedCount, 0L);
                })
                .toList();
        return withPercent(items);
    }

    private DistributionStatsResponse dimensionItem(String label, String key, long focusCount, long focusSeconds, long abandonedCount, long totalFocusSeconds) {
        return new DistributionStatsResponse(
                label,
                key,
                null,
                focusCount,
                focusSeconds / 60,
                focusSeconds,
                abandonedCount,
                totalFocusSeconds == 0 ? 0.0 : percent(focusSeconds, totalFocusSeconds)
        );
    }

    private List<DistributionStatsResponse> withPercent(List<DistributionStatsResponse> items) {
        long totalFocusSeconds = items.stream().mapToLong(DistributionStatsResponse::focusSeconds).sum();
        return items.stream()
                .map(item -> new DistributionStatsResponse(
                        item.label(),
                        item.key(),
                        item.date(),
                        item.focusCount(),
                        item.focusMinutes(),
                        item.focusSeconds(),
                        item.abandonedCount(),
                        totalFocusSeconds == 0 ? 0.0 : percent(item.focusSeconds(), totalFocusSeconds)
                ))
                .toList();
    }

    private Long focusMinutes(Long userId, LocalDate start, LocalDate end) {
        return focusMinutes(userId, start, end, null);
    }

    private Long focusMinutes(Long userId, LocalDate start, LocalDate end, Long collectionId) {
        return focusSeconds(userId, start, end, collectionId) / 60;
    }

    private Long focusSeconds(Long userId, LocalDate start, LocalDate end) {
        return focusSeconds(userId, start, end, null);
    }

    private Long focusSeconds(Long userId, LocalDate start, LocalDate end, Long collectionId) {
        return collectionId == null
                ? sessionRepository.sumCompletedStatsSeconds(userId, startOf(start), endOf(end))
                : sessionRepository.sumCompletedStatsSecondsInCollection(userId, collectionId, startOf(start), endOf(end));
    }

    private Long focusCount(Long userId, LocalDate start, LocalDate end) {
        return focusCount(userId, start, end, null);
    }

    private Long focusCount(Long userId, LocalDate start, LocalDate end, Long collectionId) {
        return collectionId == null
                ? sessionRepository.countCompletedStats(userId, startOf(start), endOf(end))
                : sessionRepository.countCompletedStatsInCollection(userId, collectionId, startOf(start), endOf(end));
    }

    private Long abandonedCount(Long userId, LocalDate start, LocalDate end) {
        return abandonedCount(userId, start, end, null);
    }

    private Long abandonedCount(Long userId, LocalDate start, LocalDate end, Long collectionId) {
        return collectionId == null
                ? sessionRepository.countInterruptedStats(userId, startOf(start), endOf(end))
                : sessionRepository.countInterruptedStatsInCollection(userId, collectionId, startOf(start), endOf(end));
    }

    private List<DistributionStatsResponse> hourlyDistribution(Long userId, LocalDate date) {
        return hourlyDistribution(userId, date, null);
    }

    private List<DistributionStatsResponse> hourlyDistribution(Long userId, LocalDate date, Long collectionId) {
        List<DistributionStatsResponse> result = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            LocalDateTime start = date.atTime(hour, 0);
            LocalDateTime end = hour == 23 ? date.atTime(LocalTime.MAX) : date.atTime(hour, 59, 59);
            result.add(distributionItem(userId, String.format("%02d:00", hour), date, start, end, collectionId));
        }
        return result;
    }

    private List<DistributionStatsResponse> dailyDistribution(Long userId, LocalDate start, LocalDate end, String pattern) {
        return dailyDistribution(userId, start, end, pattern, null);
    }

    private List<DistributionStatsResponse> dailyDistribution(Long userId, LocalDate start, LocalDate end, String pattern, Long collectionId) {
        List<DistributionStatsResponse> result = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            result.add(distributionItem(userId, date.format(formatter), date, startOf(date), endOf(date), collectionId));
        }
        return result;
    }

    private DistributionStatsResponse distributionItem(Long userId, String label, LocalDate date, LocalDateTime start, LocalDateTime end) {
        return distributionItem(userId, label, date, start, end, null);
    }

    private DistributionStatsResponse distributionItem(Long userId, String label, LocalDate date, LocalDateTime start, LocalDateTime end, Long collectionId) {
        long seconds = collectionId == null
                ? sessionRepository.sumCompletedStatsSeconds(userId, start, end)
                : sessionRepository.sumCompletedStatsSecondsInCollection(userId, collectionId, start, end);
        return new DistributionStatsResponse(
                label,
                label,
                date,
                collectionId == null
                        ? sessionRepository.countCompletedStats(userId, start, end)
                        : sessionRepository.countCompletedStatsInCollection(userId, collectionId, start, end),
                seconds / 60,
                seconds,
                collectionId == null
                        ? sessionRepository.countInterruptedStats(userId, start, end)
                        : sessionRepository.countInterruptedStatsInCollection(userId, collectionId, start, end),
                0.0
        );
    }

    private List<PeriodDistributionResponse> periodDistribution(LocalDate start, LocalDate end) {
        return periodDistribution(start, end, null);
    }

    private List<PeriodDistributionResponse> periodDistribution(LocalDate start, LocalDate end, Long collectionId) {
        Long userId = SecurityUtils.currentUserId();
        Map<Integer, PeriodDistributionResponse> byHour = new HashMap<>();
        List<Object[]> rows = collectionId == null
                ? sessionRepository.aggregatePeriodDistribution(userId, startOf(start), endOf(end))
                : sessionRepository.aggregatePeriodDistributionInCollection(userId, collectionId, startOf(start), endOf(end));
        for (Object[] row : rows) {
            int hour = ((Number) row[0]).intValue();
            long count = ((Number) row[1]).longValue();
            long seconds = ((Number) row[2]).longValue();
            byHour.put(hour, new PeriodDistributionResponse(String.format("%02d:00", hour), hour, count, seconds / 60, seconds));
        }
        List<PeriodDistributionResponse> result = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            result.add(byHour.getOrDefault(hour, new PeriodDistributionResponse(String.format("%02d:00", hour), hour, 0L, 0L, 0L)));
        }
        return result;
    }

    private Double completionRate(long completed, long abandoned) {
        long total = completed + abandoned;
        if (total == 0) {
            return 0.0;
        }
        return Math.round((completed * 10000.0 / total)) / 100.0;
    }

    private Double percent(long part, long total) {
        if (total == 0) {
            return 0.0;
        }
        return Math.round(part * 10000.0 / total) / 100.0;
    }

    private int activeDaysInRange(Long userId, LocalDate start, LocalDate end) {
        return activeDaysInRange(userId, start, end, null);
    }

    private int activeDaysInRange(Long userId, LocalDate start, LocalDate end, Long collectionId) {
        return (int) statsDateSet(userId, collectionId).stream()
                .filter(date -> !date.isBefore(start) && !date.isAfter(end))
                .count();
    }

    private Set<LocalDate> statsDateSet(Long userId) {
        return statsDateSet(userId, null);
    }

    private Set<LocalDate> statsDateSet(Long userId, Long collectionId) {
        Set<LocalDate> dates = new HashSet<>();
        List<Date> rows = collectionId == null
                ? sessionRepository.findStatsDates(userId)
                : sessionRepository.findStatsDatesInCollection(userId, collectionId);
        for (Date date : rows) {
            dates.add(date.toLocalDate());
        }
        return dates;
    }

    private int longestStreakDays(Long userId, LocalDate start, LocalDate end) {
        return longestStreakDays(userId, start, end, null);
    }

    private int longestStreakDays(Long userId, LocalDate start, LocalDate end, Long collectionId) {
        List<LocalDate> dates = statsDateSet(userId, collectionId).stream()
                .filter(date -> !date.isBefore(start) && !date.isAfter(end))
                .sorted()
                .toList();
        int longest = 0;
        int current = 0;
        LocalDate previous = null;
        for (LocalDate date : dates) {
            if (previous == null || date.equals(previous.plusDays(1))) {
                current++;
            } else {
                current = 1;
            }
            longest = Math.max(longest, current);
            previous = date;
        }
        return longest;
    }

    private DateRange resolveDateRange(String range, LocalDate date, String monthValue, LocalDate startDate, LocalDate endDate) {
        String normalized = range == null || range.isBlank() ? "day" : range;
        return switch (normalized) {
            case "week" -> new DateRange(
                    startDate == null ? LocalDate.now().minusDays(6) : startDate,
                    endDate == null ? LocalDate.now() : endDate
            );
            case "month" -> {
                YearMonth month = monthValue == null || monthValue.isBlank() ? YearMonth.now() : YearMonth.parse(monthValue);
                yield new DateRange(month.atDay(1), month.atEndOfMonth());
            }
            case "custom" -> new DateRange(
                    startDate == null ? LocalDate.now() : startDate,
                    endDate == null ? LocalDate.now() : endDate
            );
            default -> {
                LocalDate target = date == null ? LocalDate.now() : date;
                yield new DateRange(target, target);
            }
        };
    }

    private LocalDate toLocalDate(Object value) {
        if (value instanceof Date date) {
            return date.toLocalDate();
        }
        if (value instanceof java.sql.Timestamp timestamp) {
            return timestamp.toLocalDateTime().toLocalDate();
        }
        if (value instanceof LocalDate localDate) {
            return localDate;
        }
        return LocalDate.parse(String.valueOf(value));
    }

    private LocalDateTime toLocalDateTime(Object value) {
        if (value instanceof java.sql.Timestamp timestamp) {
            return timestamp.toLocalDateTime();
        }
        if (value instanceof LocalDateTime localDateTime) {
            return localDateTime;
        }
        String text = String.valueOf(value).replace(' ', 'T');
        return LocalDateTime.parse(text);
    }

    private CheckinLineResponse checkinLineItem(Object[] row, boolean sleep) {
        LocalDate date = toLocalDate(row[0]);
        LocalTime time = toLocalDateTime(row[1]).toLocalTime();
        int minutes = time.getHour() * 60 + time.getMinute();
        if (sleep && time.getHour() < 12) {
            minutes += 24 * 60;
        }
        return new CheckinLineResponse(date, time.format(TIME_FORMATTER), minutes);
    }

    private String interruptReasonText(String reason) {
        return switch (reason == null ? "other" : reason) {
            case "plan_changed" -> "\u8ba1\u5212\u6709\u53d8";
            case "interrupted" -> "\u88ab\u6253\u65ad";
            case "too_tired" -> "\u592a\u7d2f\u4e86";
            case "not_want" -> "\u4e0d\u60f3\u505a\u4e86";
            default -> "\u5176\u4ed6";
        };
    }

    private LocalDateTime startOf(LocalDate date) {
        return date.atStartOfDay();
    }

    private LocalDateTime endOf(LocalDate date) {
        return date.atTime(LocalTime.MAX);
    }

    private String todayCacheKey(Long userId, LocalDate date) {
        return "stats:today:" + userId + ":" + date;
    }

    private record DateRange(LocalDate start, LocalDate end) {
    }
}
