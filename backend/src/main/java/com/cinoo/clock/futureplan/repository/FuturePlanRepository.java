package com.cinoo.clock.futureplan.repository;

import com.cinoo.clock.futureplan.entity.FuturePlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FuturePlanRepository extends JpaRepository<FuturePlan, Long> {
    List<FuturePlan> findByUserIdAndDeletedFalseOrderByTargetDateAscCreatedAtDesc(Long userId);

    Optional<FuturePlan> findByIdAndUserIdAndDeletedFalse(Long id, Long userId);
}
