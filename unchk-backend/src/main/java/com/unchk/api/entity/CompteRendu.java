package com.unchk.api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "comptes_rendus")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompteRendu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // reunion | seminaire | webinaire | conseil | rencontre
    @Column(name = "type_reunion", nullable = false, length = 50)
    private String typeReunion;

    @Column(nullable = false)
    private LocalDate date;

    @Column(length = 200)
    private String lieu;

    @Column(columnDefinition = "TEXT")
    private String participants;

    @Column(columnDefinition = "TEXT")
    private String contenu;

    @ManyToOne
    @JoinColumn(name = "id_auteur")
    private Utilisateur auteur;

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
