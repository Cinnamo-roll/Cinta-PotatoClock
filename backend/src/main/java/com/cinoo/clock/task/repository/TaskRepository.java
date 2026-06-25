package com.cinoo.clock.task.repository;

import com.cinoo.clock.common.enums.TaskStatus;
import com.cinoo.clock.task.entity.FocusTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<FocusTask, Long> {
    List<FocusTask> findByUserIdAndDeletedFalseOrderBySortOrderAscCreatedAtDesc(Long userId);

    List<FocusTask> findByUserIdAndStatusAndDeletedFalseOrderBySortOrderAscCreatedAtDesc(Long userId, TaskStatus status);

    List<FocusTask> findByUserIdAndCollectionIdAndDeletedFalseOrderBySortOrderAscCreatedAtDesc(Long userId, Long collectionId);

    Optional<FocusTask> findByIdAndUserIdAndDeletedFalse(Long id, Long userId);

    long countByUserIdAndCollectionIdAndDeletedFalse(Long userId, Long collectionId);

    long countByUserIdAndStatusAndCompletedAtBetween(Long userId, TaskStatus status, LocalDateTime start, LocalDateTime end);

    long countByUserIdAndStatus(Long userId, TaskStatus status);

    @Modifying
    @Query("update FocusTask t set t.current = false where t.userId = :userId and t.current = true")
    void clearCurrentTask(@Param("userId") Long userId);

    @Modifying
    @Query("update FocusTask t set t.collectionId = null where t.userId = :userId and t.collectionId = :collectionId")
    void clearCollection(@Param("userId") Long userId, @Param("collectionId") Long collectionId);
}
