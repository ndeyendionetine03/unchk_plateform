package com.unchk.api.controller;

import com.unchk.api.entity.Etudiant;
import com.unchk.api.entity.Utilisateur;
import com.unchk.api.repository.EtudiantRepository;
import com.unchk.api.repository.FormationRepository;
import com.unchk.api.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/etudiants")
@CrossOrigin(origins = "http://localhost:4200")
public class EtudiantController {

    @Autowired private EtudiantRepository etudiantRepository;
    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private FormationRepository formationRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private static final String MDP_PAR_DEFAUT = "unchk123";

    @GetMapping
    public List<Etudiant> getAll() {
        return etudiantRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Etudiant> getById(@PathVariable Long id) {
        return etudiantRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ine/{ine}")
    public ResponseEntity<Etudiant> getByIne(@PathVariable String ine) {
        return etudiantRepository.findByIne(ine)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/etudiants
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Etudiant etudiant) {
        Utilisateur u = etudiant.getUtilisateur();
        if (u == null || estVide(u.getNom()) || estVide(u.getPrenom()) || estVide(u.getEmail())) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Le nom, le prénom et l'email de l'étudiant sont obligatoires."));
        }

        if (u.getId() == null) {
            if (utilisateurRepository.existsByEmail(u.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Cet email est déjà utilisé par un autre compte."));
            }
            if (estVide(u.getRole())) u.setRole("etudiant");
            String mdp = estVide(u.getMotDePasse()) ? MDP_PAR_DEFAUT : u.getMotDePasse();
            u.setMotDePasse(passwordEncoder.encode(mdp));
            etudiant.setUtilisateur(utilisateurRepository.save(u));
        } else {
            etudiant.setUtilisateur(utilisateurRepository.findById(u.getId()).orElse(u));
        }

        etudiant.setFormation(resoudreFormation(etudiant.getFormation()));
        return ResponseEntity.ok(etudiantRepository.save(etudiant));
    }

    // PUT /api/etudiants/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Etudiant data) {
        return etudiantRepository.findById(id).<ResponseEntity<?>>map(e -> {
            e.setIne(data.getIne());
            e.setDateNaissance(data.getDateNaissance());
            e.setPromo(data.getPromo());
            e.setAnneeDebut(data.getAnneeDebut());
            e.setAnneeSortie(data.getAnneeSortie());
            e.setDiplomes(data.getDiplomes());
            e.setAutresFormations(data.getAutresFormations());

            if (data.getFormation() != null && data.getFormation().getId() != null) {
                e.setFormation(resoudreFormation(data.getFormation()));
            }

            // Mise a jour des informations de l'utilisateur lie
            if (data.getUtilisateur() != null && e.getUtilisateur() != null) {
                Utilisateur src = data.getUtilisateur();
                Utilisateur cible = e.getUtilisateur();
                if (!estVide(src.getNom())) cible.setNom(src.getNom());
                if (!estVide(src.getPrenom())) cible.setPrenom(src.getPrenom());
                if (!estVide(src.getEmail())) cible.setEmail(src.getEmail());
                utilisateurRepository.save(cible);
            }

            return ResponseEntity.ok(etudiantRepository.save(e));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/etudiants/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!etudiantRepository.existsById(id)) return ResponseEntity.notFound().build();
        etudiantRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // -- helpers --------------------------------------------------------------

    private com.unchk.api.entity.Formation resoudreFormation(com.unchk.api.entity.Formation f) {
        if (f != null && f.getId() != null) {
            return formationRepository.findById(f.getId()).orElse(null);
        }
        return null;
    }

    private boolean estVide(String s) {
        return s == null || s.isBlank();
    }
}
