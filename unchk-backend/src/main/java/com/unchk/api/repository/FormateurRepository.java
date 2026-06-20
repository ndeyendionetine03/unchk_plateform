package com.unchk.api.repository;
import com.unchk.api.entity.Formateur;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface FormateurRepository extends JpaRepository<Formateur, Long> {
    List<Formateur> findByStatut(String statut);
}
