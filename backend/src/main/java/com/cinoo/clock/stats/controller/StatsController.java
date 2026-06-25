package com.cinoo.clock.stats.controller;

import com.cinoo.clock.common.enums.CheckinType;
import com.cinoo.clock.common.response.ApiResponse;
import com.cinoo.clock.potato.dto.PotatoSessionResponse;
import com.cinoo.clock.stats.dto.*;
import com.cinoo.clock.stats.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Stats", description = "Focus statistics")
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {
    private final StatsService statsService;

    @Operation(summary = "Today focus stats")
    @GetMapping("/today")
    public ApiResponse<TodayStatsResponse> today(@RequestParam(required = false) Long collectionId) {
        return ApiResponse.success(statsService.today(collectionId));
    }

    @Operation(summary = "Recent 7 days stats")
    @GetMapping("/week")
    public ApiResponse<List<DailyStatsResponse>> week(@RequestParam(required = false) Long collectionId) {
        return ApiResponse.success(statsService.week(collectionId));
    }

    @Operation(summary = "Monthly focus stats")
    @GetMapping("/month")
    public ApiResponse<MonthStatsResponse> month(@RequestParam(required = false) String month,
                                                 @RequestParam(required = false) Long collectionId) {
        return ApiResponse.success(statsService.month(month, collectionId));
    }

    @Operation(summary = "Summary focus stats")
    @GetMapping("/summary")
    public ApiResponse<SummaryStatsResponse> summary(@RequestParam(required = false) Long collectionId) {
        return ApiResponse.success(statsService.summary(collectionId));
    }

    @Operation(summary = "Focus duration distribution")
    @GetMapping("/distribution")
    public ApiResponse<List<DistributionStatsResponse>> distribution(@RequestParam(defaultValue = "day") String range,
                                                                     @RequestParam(required = false) LocalDate date,
                                                                     @RequestParam(required = false) String month,
                                                                     @RequestParam(required = false) LocalDate startDate,
                                                                     @RequestParam(required = false) LocalDate endDate,
                                                                     @RequestParam(required = false) String groupBy,
                                                                     @RequestParam(required = false) Long collectionId) {
        return ApiResponse.success(statsService.distribution(range, date, month, startDate, endDate, groupBy, collectionId));
    }

    @Operation(summary = "Calendar focus stats")
    @GetMapping("/calendar")
    public ApiResponse<List<CalendarStatsResponse>> calendar(@RequestParam(required = false) String month,
                                                             @RequestParam(required = false) Long collectionId) {
        return ApiResponse.success(statsService.calendar(month, collectionId));
    }

    @Operation(summary = "Weekly focus summary")
    @GetMapping("/week-summary")
    public ApiResponse<WeekSummaryResponse> weekSummary(@RequestParam(required = false) LocalDate startDate,
                                                        @RequestParam(required = false) LocalDate endDate,
                                                        @RequestParam(required = false) Long collectionId) {
        return ApiResponse.success(statsService.weekSummary(startDate, endDate, collectionId));
    }

    @Operation(summary = "Monthly interruption reason stats")
    @GetMapping("/interruption-reasons")
    public ApiResponse<List<InterruptionReasonStatsResponse>> interruptionReasons(@RequestParam(required = false) String month,
                                                                                  @RequestParam(required = false) Long collectionId) {
        return ApiResponse.success(statsService.interruptionReasons(month, collectionId));
    }

    @Operation(summary = "Monthly focus period distribution")
    @GetMapping("/period-distribution")
    public ApiResponse<List<PeriodDistributionResponse>> periodDistribution(@RequestParam(required = false) String month,
                                                                            @RequestParam(required = false) Long collectionId) {
        return ApiResponse.success(statsService.periodDistribution(month, collectionId));
    }

    @Operation(summary = "Monthly wakeup checkin hour distribution")
    @GetMapping("/checkins/wakeup-distribution")
    public ApiResponse<List<CheckinHourDistributionResponse>> wakeupDistribution(@RequestParam(required = false) String month) {
        return ApiResponse.success(statsService.checkinHourDistribution(CheckinType.wakeup, month));
    }

    @Operation(summary = "Monthly sleep checkin hour distribution")
    @GetMapping("/checkins/sleep-distribution")
    public ApiResponse<List<CheckinHourDistributionResponse>> sleepDistribution(@RequestParam(required = false) String month) {
        return ApiResponse.success(statsService.checkinHourDistribution(CheckinType.sleep, month));
    }

    @Operation(summary = "Monthly wakeup checkin date-time line")
    @GetMapping("/checkins/wakeup-line")
    public ApiResponse<List<CheckinLineResponse>> wakeupLine(@RequestParam(required = false) String month) {
        return ApiResponse.success(statsService.wakeupLine(month));
    }

    @Operation(summary = "Monthly sleep checkin date-time line")
    @GetMapping("/checkins/sleep-line")
    public ApiResponse<List<CheckinLineResponse>> sleepLine(@RequestParam(required = false) String month) {
        return ApiResponse.success(statsService.sleepLine(month));
    }

    @Operation(summary = "Monthly checkin daily stats")
    @GetMapping("/checkins/month")
    public ApiResponse<List<CheckinMonthStatsResponse>> checkinMonth(@RequestParam(required = false) String month) {
        return ApiResponse.success(statsService.checkinMonth(month));
    }

    @Operation(summary = "Yearly focus stats")
    @GetMapping("/year")
    public ApiResponse<YearStatsResponse> year(@RequestParam(required = false) Integer year,
                                               @RequestParam(required = false) Long collectionId) {
        return ApiResponse.success(statsService.year(year, collectionId));
    }

    @Operation(summary = "Task dimension stats")
    @GetMapping("/tasks")
    public ApiResponse<List<TaskStatsResponse>> tasks(@RequestParam(required = false) LocalDate startDate,
                                                      @RequestParam(required = false) LocalDate endDate,
                                                      @RequestParam(defaultValue = "10") int limit,
                                                      @RequestParam(required = false) Long collectionId) {
        return ApiResponse.success(statsService.taskStats(startDate, endDate, limit, collectionId));
    }

    @Operation(summary = "Recent focus sessions")
    @GetMapping("/sessions/recent")
    public ApiResponse<List<PotatoSessionResponse>> recentSessions(@RequestParam(defaultValue = "20") int limit,
                                                                     @RequestParam(required = false) Long collectionId) {
        return ApiResponse.success(statsService.recentSessions(limit, collectionId));
    }
}
