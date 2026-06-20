package com.unchk.api.controller;

import com.unchk.api.entity.CompteRendu;
import com.unchk.api.repository.CompteRenduRepository;
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
@RequestMapping("/api/comptes-rendus")
@CrossOrigin(origins = "http://localhost:4200")
public class CompteRenduController {

    @Autowired private CompteRenduRepository compteRenduRepository;
    @Autowired private FileStorageService fileStorageService;

    @GetMapping
    public List<CompteRendu> getAll() {
        return compteRenduRepository.findAllByOrderByDateCreationDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompteRendu> getById(@PathVariable Long id) {
        return compteRenduRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CompteRendu compteRendu) {
        if (compteRendu.getTypeReunion() == null || compteRendu.getTypeReunion().isBlank()
                || compteRendu.getDate() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Le type de réunion et la date sont obligatoires."));
        }
        return ResponseEntity.ok(compteRenduRepository.save(compteRendu));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody CompteRendu data) {
        return compteRenduRepository.findById(id).<ResponseEntity<?>>map(c -> {
            c.setTypeReunion(data.getTypeReunion());
            c.setDate(data.getDate());
            c.setLieu(data.getLieu());
            c.setParticipants(data.getParticipants());
            c.setContenu(data.getContenu());
            return ResponseEntity.ok(compteRenduRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/fichier")
    public ResponseEntity<?> upload(@PathVariable Long id, @RequestParam("fichier") MultipartFile fichier) {
        return compteRenduRepository.findById(id).<ResponseEntity<?>>map(c -> {
            if (c.getFichierChemin() != null) fileStorageService.supprimer(c.getFichierChemin());
            String stockage = fileStorageService.enregistrer(fichier);
            c.setFichierChemin(stockage);
            c.setFichierNom(fichier.getOriginalFilename());
            c.setFichierType(fichier.getContentType());
            return ResponseEntity.ok(compteRenduRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/fichier")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        CompteRendu c = compteRenduRepository.findById(id).orElse(null);
        if (c == null || c.getFichierChemin() == null) return ResponseEntity.notFound().build();
        Resource resource = fileStorageService.charger(c.getFichierChemin());
        String type = c.getFichierType() != null ? c.getFichierType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(type))
            .header(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" + (c.getFichierNom() != null ? c.getFichierNom() : "fichier") + "\"")
            .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        CompteRendu c = compteRenduRepository.findById(id).orElse(null);
        if (c == null) return ResponseEntity.notFound().build();
        if (c.getFichierChemin() != null) fileStorageService.supprimer(c.getFichierChemin());
        compteRenduRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
