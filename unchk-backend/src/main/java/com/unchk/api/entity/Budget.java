package com.unchk.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "budgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String libelle;

    // projet | realise | note_orientation
    @Column(nullable = false, length = 50)
    private String type;

    @Column(name = "annee")
    private Integer annee;

    @Column(name = "montant_prevu", precision = 15, scale = 2)
    private BigDecimal montantPrevu;

    @Column(name = "montant_realise", precision = 15, scale = 2)
    private BigDecimal montantRealise;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @PrePersist
    public void prePersist() {
        this.dateCreation = LocalDateTime.now();
    }
}
