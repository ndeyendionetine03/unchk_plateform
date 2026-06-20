package com.unchk.api.repository;
import com.unchk.api.entity.CompteRendu;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface CompteRenduRepository extends JpaRepository<CompteRendu, Long> {
    List<CompteRendu> findByTypeReunion(String typeReunion);
    List<CompteRendu> findAllByOrderByDateCreationDesc();
}
