package com.unchk.api.repository;

import com.unchk.api.entity.Partenaire;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PartenaireRepository extends JpaRepository<Partenaire, Long> {
    List<Partenaire> findByStatut(String statut);
    List<Partenaire> findByType(String type);
}
