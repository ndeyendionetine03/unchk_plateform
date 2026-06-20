package com.unchk.api.controller;

import com.unchk.api.entity.Etudiant;
import com.unchk.api.entity.Insertion;
import com.unchk.api.repository.EtudiantRepository;
import com.unchk.api.repository.InsertionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/insertions")
@CrossOrigin(origins = "http://localhost:4200")
public class InsertionController {

    @Autowired private InsertionRepository insertionRepository;
    @Autowired private EtudiantRepository etudiantRepository;

    @GetMapping
    public List<Insertion> getAll() { return insertionRepository.findAll(); }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", insertionRepository.count());
        stats.put("autoEmploi", insertionRepository.countAutoEmploi());
        stats.put("salarie", insertionRepository.countSalarie());
        return ResponseEntity.ok(stats);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Insertion insertion) {
        if (insertion.getEtudiant() == null || insertion.getEtudiant().getId() == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Veuillez sélectionner l'étudiant concerné."));
        }
        Etudiant etudiant = etudiantRepository.findById(insertion.getEtudiant().getId()).orElse(null);
        if (etudiant == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Étudiant introuvable."));
        }
        if (insertion.getType() == null || insertion.getType().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Le type d'insertion est obligatoire."));
        }
        insertion.setEtudiant(etudiant);
        return ResponseEntity.ok(insertionRepository.save(insertion));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Insertion data) {
        return insertionRepository.findById(id).<ResponseEntity<?>>map(i -> {
            i.setType(data.getType());
            i.setDateInsertion(data.getDateInsertion());
            i.setEmployeur(data.getEmployeur());
            i.setPoste(data.getPoste());
            if (data.getEtudiant() != null && data.getEtudiant().getId() != null) {
                etudiantRepository.findById(data.getEtudiant().getId()).ifPresent(i::setEtudiant);
            }
            return ResponseEntity.ok(insertionRepository.save(i));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!insertionRepository.existsById(id)) return ResponseEntity.notFound().build();
        insertionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
