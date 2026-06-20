package com.unchk.api.repository;
import com.unchk.api.entity.EmploiDuTemps;
import com.unchk.api.entity.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface EmploiDuTempsRepository extends JpaRepository<EmploiDuTemps, Long> {
    List<EmploiDuTemps> findByFormation(Formation formation);
    List<EmploiDuTemps> findByJour(String jour);
}
