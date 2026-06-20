package com.unchk.api.repository;

import com.unchk.api.entity.Etudiant;
import com.unchk.api.entity.Formation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    Optional<Etudiant> findByIne(String ine);
    List<Etudiant> findByFormation(Formation formation);
    List<Etudiant> findByPromo(String promo);
}
