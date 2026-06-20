package com.unchk.api.controller;

import com.unchk.api.entity.Formation;
import com.unchk.api.repository.FormationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/formations")
@CrossOrigin(origins = "http://localhost:4200")
public class FormationController {

    @Autowired
    private FormationRepository formationRepository;

    @GetMapping
    public List<Formation> getAll() { return formationRepository.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Formation> getById(@PathVariable Long id) {
        return formationRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Formation> create(@RequestBody Formation formation) {
        return ResponseEntity.ok(formationRepository.save(formation));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Formation> update(@PathVariable Long id, @RequestBody Formation data) {
        return formationRepository.findById(id).map(f -> {
            f.setIntitule(data.getIntitule());
            f.setType(data.getType());
            f.setNiveau(data.getNiveau());
            f.setDateDebut(data.getDateDebut());
            f.setDateFin(data.getDateFin());
            f.setMontant(data.getMontant());
            f.setFinancement(data.getFinancement());
            f.setNbFormesH(data.getNbFormesH());
            f.setNbFormesF(data.getNbFormesF());
            return ResponseEntity.ok(formationRepository.save(f));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!formationRepository.existsById(id)) return ResponseEntity.notFound().build();
        formationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
