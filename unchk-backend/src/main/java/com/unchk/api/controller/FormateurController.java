package com.unchk.api.controller;

import com.unchk.api.entity.Formateur;
import com.unchk.api.entity.Utilisateur;
import com.unchk.api.repository.FormateurRepository;
import com.unchk.api.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/formateurs")
@CrossOrigin(origins = "http://localhost:4200")
public class FormateurController {

    @Autowired private FormateurRepository formateurRepository;
    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private static final String MDP_PAR_DEFAUT = "unchk123";

    @GetMapping
    public List<Formateur> getAll() { return formateurRepository.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Formateur> getById(@PathVariable Long id) {
        return formateurRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/statut/{statut}")
    public List<Formateur> getByStatut(@PathVariable String statut) {
        return formateurRepository.findByStatut(statut);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Formateur formateur) {
        Utilisateur u = formateur.getUtilisateur();
        if (u == null || estVide(u.getNom()) || estVide(u.getPrenom()) || estVide(u.getEmail())) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Le nom, le prénom et l'email du formateur sont obligatoires."));
        }
        if (estVide(formateur.getStatut())) formateur.setStatut("enseignant");

        if (u.getId() == null) {
            if (utilisateurRepository.existsByEmail(u.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Cet email est déjà utilisé par un autre compte."));
            }
            if (estVide(u.getRole())) u.setRole("enseignant");
            String mdp = estVide(u.getMotDePasse()) ? MDP_PAR_DEFAUT : u.getMotDePasse();
            u.setMotDePasse(passwordEncoder.encode(mdp));
            formateur.setUtilisateur(utilisateurRepository.save(u));
        } else {
            formateur.setUtilisateur(utilisateurRepository.findById(u.getId()).orElse(u));
        }

        return ResponseEntity.ok(formateurRepository.save(formateur));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Formateur data) {
        return formateurRepository.findById(id).<ResponseEntity<?>>map(f -> {
            f.setStatut(data.getStatut());
            f.setSpecialite(data.getSpecialite());
            f.setDatePriseFonction(data.getDatePriseFonction());
            if (data.getUtilisateur() != null && f.getUtilisateur() != null) {
                Utilisateur src = data.getUtilisateur();
                Utilisateur cible = f.getUtilisateur();
                if (!estVide(src.getNom())) cible.setNom(src.getNom());
                if (!estVide(src.getPrenom())) cible.setPrenom(src.getPrenom());
                if (!estVide(src.getEmail())) cible.setEmail(src.getEmail());
                utilisateurRepository.save(cible);
            }
            return ResponseEntity.ok(formateurRepository.save(f));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!formateurRepository.existsById(id)) return ResponseEntity.notFound().build();
        formateurRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private boolean estVide(String s) { return s == null || s.isBlank(); }
}
