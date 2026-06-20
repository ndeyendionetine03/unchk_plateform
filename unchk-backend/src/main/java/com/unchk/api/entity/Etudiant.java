package com.unchk.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "etudiants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Etudiant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    @Column(unique = true, length = 50)
    private String ine;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @ManyToOne
    @JoinColumn(name = "id_formation")
    private Formation formation;

    @Column(length = 50)
    private String promo;

    @Column(name = "annee_debut")
    private Integer anneeDebut;

    @Column(name = "annee_sortie")
    private Integer anneeSortie;

    @Column(length = 500)
    private String diplomes;

    @Column(name = "autres_formations", length = 500)
    private String autresFormations;
}
