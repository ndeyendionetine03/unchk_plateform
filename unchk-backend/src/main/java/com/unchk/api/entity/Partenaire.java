package com.unchk.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "partenaires")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Partenaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String nom;

    // entreprise | institution | ong | universite | autre
    @Column(length = 50)
    private String type;

    @Column(length = 150)
    private String domaine;

    @Column(length = 150)
    private String contact;

    @Column(length = 200)
    private String email;

    @Column(length = 50)
    private String telephone;

    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    // actif | inactif
    @Column(length = 30)
    private String statut = "actif";

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @PrePersist
    public void prePersist() {
        this.dateCreation = LocalDateTime.now();
        if (this.statut == null) this.statut = "actif";
    }
}
