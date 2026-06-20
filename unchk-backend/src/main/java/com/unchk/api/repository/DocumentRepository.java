package com.unchk.api.repository;
import com.unchk.api.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByType(String type);
    List<Document> findByVisibiliteRoleIn(List<String> roles);
}
