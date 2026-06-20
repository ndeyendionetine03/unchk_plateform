package com.unchk.api.repository;

import com.unchk.api.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByType(String type);
    List<Budget> findByAnnee(Integer annee);
}
