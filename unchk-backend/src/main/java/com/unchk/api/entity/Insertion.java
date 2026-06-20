package com.unchk.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "insertions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Insertion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_etudiant", nullable = false)
    private Etudiant etudiant;

    // auto-emploi | salarie
    @Column(nullable = false, length = 50)
    private String type;

    @Column(name = "date_insertion")
    private LocalDate dateInsertion;

    @Column(length = 200)
    private String employeur;

    @Column(length = 100)
    private String poste;
}
