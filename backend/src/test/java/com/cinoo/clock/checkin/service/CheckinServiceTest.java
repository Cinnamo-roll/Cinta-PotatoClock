package com.cinoo.clock.checkin.service;

import com.cinoo.clock.TestSecurity;
import com.cinoo.clock.checkin.dto.CheckinCreateRequest;
import com.cinoo.clock.checkin.dto.CheckinUpdateRequest;
import com.cinoo.clock.checkin.entity.CheckinRecord;
import com.cinoo.clock.checkin.repository.CheckinRecordRepository;
import com.cinoo.clock.common.enums.CheckinType;
import com.cinoo.clock.common.exception.BusinessException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CheckinServiceTest {
    @AfterEach
    void tearDown() {
        TestSecurity.clear();
    }

    @Test
    void createUsesCurrentUserAndTrimsBlankNote() {
        TestSecurity.loginAs(7L);
        CheckinRecordRepository repository = mock(CheckinRecordRepository.class);
        when(repository.save(any(CheckinRecord.class))).thenAnswer(invocation -> {
            CheckinRecord record = invocation.getArgument(0);
            record.setId(11L);
            return record;
        });
        CheckinService service = new CheckinService(repository);
        LocalDateTime checkinTime = LocalDateTime.of(2026, 6, 23, 7, 30);

        var response = service.create(new CheckinCreateRequest(CheckinType.wakeup, checkinTime, "  "));

        assertThat(response.id()).isEqualTo(11L);
        assertThat(response.type()).isEqualTo(CheckinType.wakeup);
        assertThat(response.checkinTime()).isEqualTo(checkinTime);
        assertThat(response.note()).isNull();
        verify(repository).save(argThat(record -> record.getUserId().equals(7L)));
    }

    @Test
    void createSupportsFocusTodayCheckin() {
        TestSecurity.loginAs(7L);
        CheckinRecordRepository repository = mock(CheckinRecordRepository.class);
        when(repository.save(any(CheckinRecord.class))).thenAnswer(invocation -> {
            CheckinRecord record = invocation.getArgument(0);
            record.setId(12L);
            return record;
        });
        CheckinService service = new CheckinService(repository);

        var response = service.create(new CheckinCreateRequest(
                CheckinType.focus_today,
                LocalDateTime.of(2026, 6, 23, 12, 0),
                "done"
        ));

        assertThat(response.type()).isEqualTo(CheckinType.focus_today);
        verify(repository).save(argThat(record -> record.getType() == CheckinType.focus_today));
    }

    @Test
    void createSupportsSleepCheckinInsideWindow() {
        TestSecurity.loginAs(7L);
        CheckinRecordRepository repository = mock(CheckinRecordRepository.class);
        when(repository.save(any(CheckinRecord.class))).thenAnswer(invocation -> {
            CheckinRecord record = invocation.getArgument(0);
            record.setId(13L);
            return record;
        });
        CheckinService service = new CheckinService(repository);

        var response = service.create(new CheckinCreateRequest(
                CheckinType.sleep,
                LocalDateTime.of(2026, 6, 23, 20, 0),
                null
        ));

        assertThat(response.type()).isEqualTo(CheckinType.sleep);
        verify(repository).save(argThat(record -> record.getType() == CheckinType.sleep));
    }

    @Test
    void createSupportsSleepCheckinBeforeTwoAm() {
        TestSecurity.loginAs(7L);
        CheckinRecordRepository repository = mock(CheckinRecordRepository.class);
        when(repository.save(any(CheckinRecord.class))).thenAnswer(invocation -> {
            CheckinRecord record = invocation.getArgument(0);
            record.setId(14L);
            return record;
        });
        CheckinService service = new CheckinService(repository);

        var response = service.create(new CheckinCreateRequest(
                CheckinType.sleep,
                LocalDateTime.of(2026, 6, 24, 1, 59),
                null
        ));

        assertThat(response.type()).isEqualTo(CheckinType.sleep);
        verify(repository).save(argThat(record -> record.getCheckinTime().getHour() == 1));
    }

    @Test
    void createRejectsDuplicateCheckinOnSameDay() {
        TestSecurity.loginAs(7L);
        CheckinRecordRepository repository = mock(CheckinRecordRepository.class);
        when(repository.existsByUserIdAndTypeAndCheckinTimeBetween(eq(7L), eq(CheckinType.focus_today), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(true);
        CheckinService service = new CheckinService(repository);

        assertThatThrownBy(() -> service.create(new CheckinCreateRequest(
                CheckinType.focus_today,
                LocalDateTime.of(2026, 6, 23, 12, 0),
                null
        )))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("今日专注打卡");

        verify(repository, never()).save(any());
    }

    @Test
    void createRejectsWakeupOutsideWindow() {
        TestSecurity.loginAs(7L);
        CheckinRecordRepository repository = mock(CheckinRecordRepository.class);
        CheckinService service = new CheckinService(repository);

        assertThatThrownBy(() -> service.create(new CheckinCreateRequest(
                CheckinType.wakeup,
                LocalDateTime.of(2026, 6, 23, 12, 0),
                null
        )))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("05:00-12:00 前");

        verify(repository, never()).save(any());
    }

    @Test
    void createRejectsSleepBeforeNightWindow() {
        TestSecurity.loginAs(7L);
        CheckinRecordRepository repository = mock(CheckinRecordRepository.class);
        CheckinService service = new CheckinService(repository);

        assertThatThrownBy(() -> service.create(new CheckinCreateRequest(
                CheckinType.sleep,
                LocalDateTime.of(2026, 6, 23, 19, 59),
                null
        )))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("20:00-次日 02:00 前");

        verify(repository, never()).save(any());
    }

    @Test
    void deleteOnlyDeletesCurrentUsersRecord() {
        TestSecurity.loginAs(7L);
        CheckinRecordRepository repository = mock(CheckinRecordRepository.class);
        CheckinService service = new CheckinService(repository);

        assertThatThrownBy(() -> service.delete(99L))
                .isInstanceOf(BusinessException.class);

        CheckinRecord record = new CheckinRecord();
        record.setId(99L);
        record.setUserId(7L);
        when(repository.findByIdAndUserId(99L, 7L)).thenReturn(Optional.of(record));

        service.delete(99L);

        verify(repository).delete(record);
    }

    @Test
    void updateChangesCheckinTimeAndNote() {
        TestSecurity.loginAs(7L);
        CheckinRecordRepository repository = mock(CheckinRecordRepository.class);
        CheckinRecord record = new CheckinRecord();
        record.setId(88L);
        record.setUserId(7L);
        record.setType(CheckinType.wakeup);
        record.setCheckinTime(LocalDateTime.of(2026, 6, 24, 7, 30));
        when(repository.findByIdAndUserId(88L, 7L)).thenReturn(Optional.of(record));
        when(repository.save(any(CheckinRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));
        CheckinService service = new CheckinService(repository);

        var response = service.update(88L, new CheckinUpdateRequest(LocalDateTime.of(2026, 6, 24, 8, 5), "今天慢一点"));

        assertThat(response.checkinTime()).isEqualTo(LocalDateTime.of(2026, 6, 24, 8, 5));
        assertThat(response.note()).isEqualTo("今天慢一点");
        verify(repository).existsByUserIdAndTypeAndCheckinTimeBetweenAndIdNot(eq(7L), eq(CheckinType.wakeup), any(), any(), eq(88L));
    }

    @Test
    void updateRejectsCheckinOutsideWindow() {
        TestSecurity.loginAs(7L);
        CheckinRecordRepository repository = mock(CheckinRecordRepository.class);
        CheckinRecord record = new CheckinRecord();
        record.setId(89L);
        record.setUserId(7L);
        record.setType(CheckinType.sleep);
        record.setCheckinTime(LocalDateTime.of(2026, 6, 24, 22, 0));
        when(repository.findByIdAndUserId(89L, 7L)).thenReturn(Optional.of(record));
        CheckinService service = new CheckinService(repository);

        assertThatThrownBy(() -> service.update(89L, new CheckinUpdateRequest(LocalDateTime.of(2026, 6, 24, 12, 0), null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("20:00-次日 02:00 前");

        verify(repository, never()).save(any());
    }
}
