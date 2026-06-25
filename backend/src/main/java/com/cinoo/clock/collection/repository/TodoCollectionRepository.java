package com.cinoo.clock.collection.repository;

import com.cinoo.clock.collection.entity.TodoCollection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TodoCollectionRepository extends JpaRepository<TodoCollection, Long> {
    List<TodoCollection> findByUserIdAndDeletedFalseOrderBySortOrderAscCreatedAtDesc(Long userId);

    Optional<TodoCollection> findByIdAndUserIdAndDeletedFalse(Long id, Long userId);
}
