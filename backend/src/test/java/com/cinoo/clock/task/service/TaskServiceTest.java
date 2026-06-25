package com.cinoo.clock.task.service;

import com.cinoo.clock.collection.repository.TodoCollectionRepository;
import com.cinoo.clock.TestSecurity;
import com.cinoo.clock.common.enums.TaskStatus;
import com.cinoo.clock.common.enums.TimerType;
import com.cinoo.clock.task.dto.TaskCreateRequest;
import com.cinoo.clock.task.entity.FocusTask;
import com.cinoo.clock.task.repository.TaskRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TaskServiceTest {
    @AfterEach
    void tearDown() {
        TestSecurity.clear();
    }

    @Test
    void createCurrentTaskClearsExistingCurrentTask() {
        TestSecurity.loginAs(1L);
        TaskRepository repository = mock(TaskRepository.class);
        when(repository.save(any(FocusTask.class))).thenAnswer(invocation -> invocation.getArgument(0));
        TaskService service = new TaskService(repository, mock(TodoCollectionRepository.class));

        service.create(new TaskCreateRequest("写代码", null, null, 25, TimerType.countdown, null, null, null, true, 0, null, null, null, null, true));

        verify(repository).clearCurrentTask(1L);
        verify(repository).save(argThat(task -> task.getUserId().equals(1L) && task.getCurrent()));
    }

    @Test
    void selectTaskMakesItCurrentAndDoing() {
        TestSecurity.loginAs(1L);
        TaskRepository repository = mock(TaskRepository.class);
        FocusTask task = new FocusTask();
        task.setId(10L);
        task.setUserId(1L);
        task.setTitle("专注");
        task.setStatus(TaskStatus.todo);
        when(repository.findByIdAndUserIdAndDeletedFalse(10L, 1L)).thenReturn(Optional.of(task));
        TaskService service = new TaskService(repository, mock(TodoCollectionRepository.class));

        assertThat(service.select(10L).status()).isEqualTo(TaskStatus.running);
        assertThat(task.getStatus()).isEqualTo(TaskStatus.running);
        verify(repository).clearCurrentTask(1L);
    }
}
