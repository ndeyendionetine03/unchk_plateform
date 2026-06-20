package com.unchk.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "formateurs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Formateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    // enseignant | associe | tuteur | responsable
    @Column(nullable = false, length = 50)
    private String statut;

    @Column(length = 100)
    private String specialite;

    @Column(name = "date_prise_fonction")
    private LocalDate datePriseFonction;
}
