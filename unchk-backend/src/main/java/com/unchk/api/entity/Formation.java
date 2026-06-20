package com.unchk.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "formations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Formation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String intitule;

    // initiale | continue | certifiante | privee
    @Column(length = 50)
    private String type;

    // Licence | Master | Doctorat | BTS | etc.
    @Column(length = 50)
    private String niveau;

    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Column(precision = 12, scale = 2)
    private BigDecimal montant;

    @Column(length = 100)
    private String financement;

    @Column(name = "nb_formes_h")
    private Integer nbFormesH = 0;

    @Column(name = "nb_formes_f")
    private Integer nbFormesF = 0;
}
