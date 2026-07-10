package com.cinoo.clock.potato.service;

import com.cinoo.clock.TestSecurity;
import com.cinoo.clock.collection.repository.TodoCollectionRepository;
import com.cinoo.clock.common.enums.ErrorCode;
import com.cinoo.clock.common.enums.SessionMode;
import com.cinoo.clock.common.enums.TimerType;
import com.cinoo.clock.common.exception.BusinessException;
import com.cinoo.clock.potato.dto.PotatoSessionCreateRequest;
import com.cinoo.clock.potato.dto.PotatoSessionUpdateRequest;
import com.cinoo.clock.potato.entity.PotatoSession;
import com.cinoo.clock.potato.repository.PotatoSessionRepository;
import com.cinoo.clock.task.entity.FocusTask;
import com.cinoo.clock.task.repository.TaskRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PotatoSessionServiceTest {
    @AfterEach
    void tearDown() {
        TestSecurity.clear();
    }

    @Test
    void completedFocusSessionIncrementsTaskPotatoes() {
        TestSecurity.loginAs(1L);
        PotatoSessionRepository sessionRepository = mock(PotatoSessionRepository.class);
        TaskRepository taskRepository = mock(TaskRepository.class);
        StringRedisTemplate redis = mock(StringRedisTemplate.class);
        FocusTask task = new FocusTask();
        task.setId(2L);
        task.setUserId(1L);
        task.setTitle("写代码");
        task.setCompletedPotatoes(0);
        when(taskRepository.findByIdAndUserIdAndDeletedFalse(2L, 1L)).thenReturn(Optional.of(task));
        when(sessionRepository.save(any(PotatoSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        PotatoSessionService service = new PotatoSessionService(sessionRepository, taskRepository, mock(TodoCollectionRepository.class), redis);
        LocalDateTime now = LocalDateTime.of(2026, 6, 24, 9, 0);
        LocalDateTime startedAt = now.minusMinutes(25);

        service.create(new PotatoSessionCreateRequest(2L, null, null, SessionMode.focus, null, null, 25, 25, 1500, startedAt, now, true, false, null, true, null));

        assertThat(task.getCompletedPotatoes()).isEqualTo(1);
        verify(redis).delete("stats:today:1:" + startedAt.toLocalDate());
    }

    @Test
    void sessionShorterThanFiveSecondsIsRejected() {
        TestSecurity.loginAs(1L);
        PotatoSessionService service = new PotatoSessionService(
                mock(PotatoSessionRepository.class),
                mock(TaskRepository.class),
                mock(TodoCollectionRepository.class),
                mock(StringRedisTemplate.class)
        );
        LocalDateTime now = LocalDateTime.now();

        assertThatThrownBy(() -> service.create(new PotatoSessionCreateRequest(
                null, null, null, SessionMode.focus, null, null, 0, 0, 4, now.minusSeconds(4), now, false, true, "interrupted", true, null)))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.PARAM_ERROR);
    }

    @Test
    void noTimerCompletionCanRecordZeroSecondsWithoutEnteringStats() {
        TestSecurity.loginAs(1L);
        PotatoSessionRepository sessionRepository = mock(PotatoSessionRepository.class);
        TaskRepository taskRepository = mock(TaskRepository.class);
        FocusTask task = new FocusTask();
        task.setId(2L);
        task.setUserId(1L);
        task.setTitle("喝水");
        task.setTimerType(TimerType.none);
        task.setCountToStats(true);
        task.setCompletedPotatoes(0);
        when(taskRepository.findByIdAndUserIdAndDeletedFalse(2L, 1L)).thenReturn(Optional.of(task));
        when(sessionRepository.save(any(PotatoSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        PotatoSessionService service = new PotatoSessionService(
                sessionRepository,
                taskRepository,
                mock(TodoCollectionRepository.class),
                mock(StringRedisTemplate.class)
        );
        LocalDateTime completedAt = LocalDateTime.of(2026, 7, 11, 9, 30);

        var response = service.create(new PotatoSessionCreateRequest(
                2L, null, null, SessionMode.focus, TimerType.none, null, 0, 0, 0,
                completedAt, completedAt, true, false, null, true, null));

        assertThat(response.actualSeconds()).isZero();
        assertThat(response.countToStats()).isFalse();
        assertThat(task.getCompletedPotatoes()).isZero();
    }

    @Test
    void completedAndInterruptedCannotBothBeTrue() {
        TestSecurity.loginAs(1L);
        PotatoSessionService service = new PotatoSessionService(
                mock(PotatoSessionRepository.class),
                mock(TaskRepository.class),
                mock(TodoCollectionRepository.class),
                mock(StringRedisTemplate.class)
        );
        LocalDateTime now = LocalDateTime.now();

        assertThatThrownBy(() -> service.create(new PotatoSessionCreateRequest(
                null, null, null, SessionMode.focus, null, null, 1, null, 60, now.minusSeconds(60), now, true, true, "interrupted", true, null)))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.PARAM_ERROR);
    }

    @Test
    void taskOptedOutOfStatsOverridesRequestFlag() {
        TestSecurity.loginAs(1L);
        PotatoSessionRepository sessionRepository = mock(PotatoSessionRepository.class);
        TaskRepository taskRepository = mock(TaskRepository.class);
        FocusTask task = new FocusTask();
        task.setId(2L);
        task.setUserId(1L);
        task.setTitle("No stats");
        task.setCountToStats(false);
        task.setCompletedPotatoes(0);
        when(taskRepository.findByIdAndUserIdAndDeletedFalse(2L, 1L)).thenReturn(Optional.of(task));
        when(sessionRepository.save(any(PotatoSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        PotatoSessionService service = new PotatoSessionService(sessionRepository, taskRepository, mock(TodoCollectionRepository.class), mock(StringRedisTemplate.class));
        LocalDateTime now = LocalDateTime.now();

        var response = service.create(new PotatoSessionCreateRequest(
                2L, null, null, SessionMode.focus, null, null, 25, null, 1500, now.minusMinutes(25), now, true, false, null, true, null));

        assertThat(response.countToStats()).isFalse();
        assertThat(task.getCompletedPotatoes()).isZero();
    }

    @Test
    void interruptedSessionStoresInterruptReason() {
        TestSecurity.loginAs(1L);
        PotatoSessionRepository sessionRepository = mock(PotatoSessionRepository.class);
        when(sessionRepository.save(any(PotatoSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        PotatoSessionService service = new PotatoSessionService(
                sessionRepository,
                mock(TaskRepository.class),
                mock(TodoCollectionRepository.class),
                mock(StringRedisTemplate.class)
        );
        LocalDateTime now = LocalDateTime.now();

        var response = service.create(new PotatoSessionCreateRequest(
                null, null, null, SessionMode.focus, null, null, 25, null, 600, now.minusMinutes(10), now,
                false, true, "too_tired", true, null));

        assertThat(response.interruptReason()).isEqualTo("too_tired");
        assertThat(response.interruptReasonText()).isNotBlank();
    }

    @Test
    void pageSupportsMonthAndKeepsPaginationShape() {
        TestSecurity.loginAs(1L);
        PotatoSessionRepository sessionRepository = mock(PotatoSessionRepository.class);
        PotatoSession session = new PotatoSession();
        session.setId(1L);
        session.setUserId(1L);
        session.setMode(SessionMode.focus);
        session.setPlannedMinutes(25);
        session.setActualMinutes(25);
        session.setActualSeconds(1500);
        session.setStartedAt(LocalDateTime.of(2026, 6, 23, 9, 0));
        session.setEndedAt(LocalDateTime.of(2026, 6, 23, 9, 25));
        session.setCompleted(true);
        session.setInterrupted(false);
        session.setCountToStats(true);
        when(sessionRepository.findAll(any(Specification.class), org.mockito.ArgumentMatchers.<Pageable>any()))
                .thenReturn(new PageImpl<>(List.of(session)));
        PotatoSessionService service = new PotatoSessionService(
                sessionRepository,
                mock(TaskRepository.class),
                mock(TodoCollectionRepository.class),
                mock(StringRedisTemplate.class)
        );

        var response = service.page(null, null, "2026-06", null, null, null, null, 0, 20);

        assertThat(response.content()).hasSize(1);
        assertThat(response.page()).isZero();
        assertThat(response.size()).isEqualTo(20);
        verify(sessionRepository).findAll(any(Specification.class),
                org.mockito.ArgumentMatchers.<Pageable>argThat(pageable -> pageable.getPageNumber() == 0 && pageable.getPageSize() == 20));
    }

    @Test
    void updateAdjustsDurationAndEndTime() {
        TestSecurity.loginAs(1L);
        PotatoSessionRepository sessionRepository = mock(PotatoSessionRepository.class);
        StringRedisTemplate redis = mock(StringRedisTemplate.class);
        PotatoSession session = new PotatoSession();
        session.setId(8L);
        session.setUserId(1L);
        session.setMode(SessionMode.focus);
        session.setPlannedMinutes(25);
        session.setActualMinutes(25);
        session.setActualSeconds(1500);
        session.setStartedAt(LocalDateTime.of(2026, 6, 24, 9, 0));
        session.setEndedAt(LocalDateTime.of(2026, 6, 24, 9, 25));
        session.setCompleted(true);
        session.setInterrupted(false);
        session.setCountToStats(true);
        when(sessionRepository.findByIdAndUserId(8L, 1L)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(PotatoSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        PotatoSessionService service = new PotatoSessionService(sessionRepository, mock(TaskRepository.class), mock(TodoCollectionRepository.class), redis);

        var response = service.update(8L, new PotatoSessionUpdateRequest(null, LocalDateTime.of(2026, 6, 24, 9, 5), LocalDateTime.of(2026, 6, 24, 9, 40), "加时完成"));

        assertThat(response.startedAt()).isEqualTo(LocalDateTime.of(2026, 6, 24, 9, 5));
        assertThat(response.actualMinutes()).isEqualTo(35);
        assertThat(response.actualSeconds()).isEqualTo(2100);
        assertThat(response.endedAt()).isEqualTo(LocalDateTime.of(2026, 6, 24, 9, 40));
        assertThat(response.note()).isEqualTo("加时完成");
        verify(redis).delete("stats:today:1:2026-06-24");
    }

    @Test
    void deleteRollsBackCompletedTaskPotato() {
        TestSecurity.loginAs(1L);
        PotatoSessionRepository sessionRepository = mock(PotatoSessionRepository.class);
        TaskRepository taskRepository = mock(TaskRepository.class);
        StringRedisTemplate redis = mock(StringRedisTemplate.class);
        PotatoSession session = new PotatoSession();
        session.setId(9L);
        session.setUserId(1L);
        session.setTaskId(2L);
        session.setStartedAt(LocalDateTime.of(2026, 6, 24, 9, 0));
        session.setCompleted(true);
        session.setInterrupted(false);
        session.setCountToStats(true);
        FocusTask task = new FocusTask();
        task.setId(2L);
        task.setUserId(1L);
        task.setCompletedPotatoes(3);
        when(sessionRepository.findByIdAndUserId(9L, 1L)).thenReturn(Optional.of(session));
        when(taskRepository.findByIdAndUserIdAndDeletedFalse(2L, 1L)).thenReturn(Optional.of(task));
        PotatoSessionService service = new PotatoSessionService(sessionRepository, taskRepository, mock(TodoCollectionRepository.class), redis);

        service.delete(9L);

        assertThat(task.getCompletedPotatoes()).isEqualTo(2);
        verify(sessionRepository).delete(session);
        verify(redis).delete("stats:today:1:2026-06-24");
    }
}
