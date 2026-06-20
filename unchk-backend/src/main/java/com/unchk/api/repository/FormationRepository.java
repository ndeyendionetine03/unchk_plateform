package com.unchk.api.repository;

import com.unchk.api.entity.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FormationRepository extends JpaRepository<Formation, Long> {
    List<Formation> findByNiveau(String niveau);
    List<Formation> findByType(String type);
}
