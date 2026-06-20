package com.unchk.api.controller;

import com.unchk.api.entity.Partenaire;
import com.unchk.api.repository.PartenaireRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/partenaires")
@CrossOrigin(origins = "http://localhost:4200")
public class PartenaireController {

    @Autowired private PartenaireRepository partenaireRepository;

    @GetMapping
    public List<Partenaire> getAll() { return partenaireRepository.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Partenaire> getById(@PathVariable Long id) {
        return partenaireRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Partenaire partenaire) {
        if (partenaire.getNom() == null || partenaire.getNom().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Le nom du partenaire est obligatoire."));
        }
        return ResponseEntity.ok(partenaireRepository.save(partenaire));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Partenaire data) {
        return partenaireRepository.findById(id).<ResponseEntity<?>>map(p -> {
            p.setNom(data.getNom());
            p.setType(data.getType());
            p.setDomaine(data.getDomaine());
            p.setContact(data.getContact());
            p.setEmail(data.getEmail());
            p.setTelephone(data.getTelephone());
            p.setDateDebut(data.getDateDebut());
            p.setDateFin(data.getDateFin());
            p.setStatut(data.getStatut());
            return ResponseEntity.ok(partenaireRepository.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!partenaireRepository.existsById(id)) return ResponseEntity.notFound().build();
        partenaireRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
