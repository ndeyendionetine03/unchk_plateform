package com.unchk.api.controller;

import com.unchk.api.entity.Document;
import com.unchk.api.repository.DocumentRepository;
import com.unchk.api.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:4200")
public class DocumentController {

    @Autowired private DocumentRepository documentRepository;
    @Autowired private FileStorageService fileStorageService;

    @GetMapping
    public List<Document> getAll() { return documentRepository.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getById(@PathVariable Long id) {
        return documentRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{type}")
    public List<Document> getByType(@PathVariable String type) {
        return documentRepository.findByType(type);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Document document) {
        if (document.getType() == null || document.getType().isBlank()
                || document.getTitre() == null || document.getTitre().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Le type et le titre sont obligatoires."));
        }
        return ResponseEntity.ok(documentRepository.save(document));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Document data) {
        return documentRepository.findById(id).<ResponseEntity<?>>map(d -> {
            d.setType(data.getType());
            d.setTitre(data.getTitre());
            d.setContenu(data.getContenu());
            d.setVisibiliteRole(data.getVisibiliteRole());
            return ResponseEntity.ok(documentRepository.save(d));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Upload d'un fichier joint
    @PostMapping("/{id}/fichier")
    public ResponseEntity<?> upload(@PathVariable Long id, @RequestParam("fichier") MultipartFile fichier) {
        return documentRepository.findById(id).<ResponseEntity<?>>map(d -> {
            if (d.getFichierChemin() != null) fileStorageService.supprimer(d.getFichierChemin());
            String stockage = fileStorageService.enregistrer(fichier);
            d.setFichierChemin(stockage);
            d.setFichierNom(fichier.getOriginalFilename());
            d.setFichierType(fichier.getContentType());
            return ResponseEntity.ok(documentRepository.save(d));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Téléchargement du fichier joint
    @GetMapping("/{id}/fichier")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Document d = documentRepository.findById(id).orElse(null);
        if (d == null || d.getFichierChemin() == null) return ResponseEntity.notFound().build();
        Resource resource = fileStorageService.charger(d.getFichierChemin());
        String type = d.getFichierType() != null ? d.getFichierType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(type))
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" + (d.getFichierNom() != null ? d.getFichierNom() : "fichier") + "\"")
            .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Document d = documentRepository.findById(id).orElse(null);
        if (d == null) return ResponseEntity.notFound().build();
        if (d.getFichierChemin() != null) fileStorageService.supprimer(d.getFichierChemin());
        documentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
