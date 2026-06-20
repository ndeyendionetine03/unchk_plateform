package com.unchk.api.repository;
import com.unchk.api.entity.Insertion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
public interface InsertionRepository extends JpaRepository<Insertion, Long> {
    List<Insertion> findByType(String type);
    long countByType(String type);

    @Query("SELECT COUNT(i) FROM Insertion i WHERE i.type = 'auto-emploi'")
    long countAutoEmploi();

    @Query("SELECT COUNT(i) FROM Insertion i WHERE i.type = 'salarie'")
    long countSalarie();
}
