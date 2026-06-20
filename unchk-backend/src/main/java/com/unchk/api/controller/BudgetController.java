package com.unchk.api.controller;

import com.unchk.api.entity.Budget;
import com.unchk.api.repository.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "http://localhost:4200")
public class BudgetController {

    @Autowired private BudgetRepository budgetRepository;

    @GetMapping
    public List<Budget> getAll() { return budgetRepository.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Budget> getById(@PathVariable Long id) {
        return budgetRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{type}")
    public List<Budget> getByType(@PathVariable String type) { return budgetRepository.findByType(type); }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Budget budget) {
        if (budget.getLibelle() == null || budget.getLibelle().isBlank()
                || budget.getType() == null || budget.getType().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Le libellé et le type sont obligatoires."));
        }
        return ResponseEntity.ok(budgetRepository.save(budget));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Budget data) {
        return budgetRepository.findById(id).<ResponseEntity<?>>map(b -> {
            b.setLibelle(data.getLibelle());
            b.setType(data.getType());
            b.setAnnee(data.getAnnee());
            b.setMontantPrevu(data.getMontantPrevu());
            b.setMontantRealise(data.getMontantRealise());
            b.setDescription(data.getDescription());
            return ResponseEntity.ok(budgetRepository.save(b));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!budgetRepository.existsById(id)) return ResponseEntity.notFound().build();
        budgetRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
