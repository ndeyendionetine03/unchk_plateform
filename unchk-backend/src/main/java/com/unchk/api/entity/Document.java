package com.unchk.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // courrier_arrive | courrier_depart | note_service | note_admin | circulaire
    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false, length = 255)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String contenu;

    @ManyToOne
    @JoinColumn(name = "id_auteur")
    private Utilisateur auteur;

    // admin | administratif | enseignant | tous
    @Column(name = "visibilite_role", length = 50)
    private String visibiliteRole = "tous";

    // Pièce jointe (fichier servant de contenu)
    @Column(name = "fichier_nom")
    private String fichierNom;

    @Column(name = "fichier_type", length = 150)
    private String fichierType;

    @Column(name = "fichier_chemin", length = 500)
    private String fichierChemin;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @PrePersist
    public void prePersist() {
        this.dateCreation = LocalDateTime.now();
    }
}
