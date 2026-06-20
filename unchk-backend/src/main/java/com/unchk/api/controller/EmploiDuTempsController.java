package com.unchk.api.controller;

import com.unchk.api.entity.EmploiDuTemps;
import com.unchk.api.repository.EmploiDuTempsRepository;
import com.unchk.api.repository.FormationRepository;
import com.unchk.api.repository.FormateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emplois-du-temps")
@CrossOrigin(origins = "http://localhost:4200")
public class EmploiDuTempsController {

    @Autowired private EmploiDuTempsRepository emploiRepository;
    @Autowired private FormationRepository formationRepository;
    @Autowired private FormateurRepository formateurRepository;

    @GetMapping
    public List<EmploiDuTemps> getAll() { return emploiRepository.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<EmploiDuTemps> getById(@PathVariable Long id) {
        return emploiRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody EmploiDuTemps emploi) {
        if (emploi.getFormation() == null || emploi.getFormation().getId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "La formation est obligatoire."));
        }
        if (emploi.getJour() == null || emploi.getJour().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Le jour est obligatoire."));
        }
        resoudreRelations(emploi);
        return ResponseEntity.ok(emploiRepository.save(emploi));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody EmploiDuTemps data) {
        return emploiRepository.findById(id).<ResponseEntity<?>>map(e -> {
            e.setJour(data.getJour());
            e.setHeureDebut(data.getHeureDebut());
            e.setHeureFin(data.getHeureFin());
            e.setMatiere(data.getMatiere());
            e.setType(data.getType());
            e.setSalle(data.getSalle());
            data.setFormation(data.getFormation() != null ? data.getFormation() : e.getFormation());
            resoudreRelations(data);
            if (data.getFormation() != null) e.setFormation(data.getFormation());
            e.setFormateur(data.getFormateur());
            return ResponseEntity.ok(emploiRepository.save(e));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!emploiRepository.existsById(id)) return ResponseEntity.notFound().build();
        emploiRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void resoudreRelations(EmploiDuTemps emploi) {
        if (emploi.getFormation() != null && emploi.getFormation().getId() != null) {
            emploi.setFormation(formationRepository.findById(emploi.getFormation().getId()).orElse(null));
        }
        if (emploi.getFormateur() != null && emploi.getFormateur().getId() != null) {
            emploi.setFormateur(formateurRepository.findById(emploi.getFormateur().getId()).orElse(null));
        } else {
            emploi.setFormateur(null);
        }
    }
}
