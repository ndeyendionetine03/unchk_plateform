package com.unchk.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Table(name = "emplois_du_temps")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmploiDuTemps {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_formation", nullable = false)
    private Formation formation;

    // Lundi | Mardi | Mercredi | Jeudi | Vendredi | Samedi
    @Column(nullable = false, length = 20)
    private String jour;

    @Column(name = "heure_debut")
    private LocalTime heureDebut;

    @Column(name = "heure_fin")
    private LocalTime heureFin;

    @Column(length = 100)
    private String matiere;

    // cours | devoir | examen | tutorat
    @Column(length = 30)
    private String type;

    @ManyToOne
    @JoinColumn(name = "id_formateur")
    private Formateur formateur;

    @Column(length = 50)
    private String salle;
}
