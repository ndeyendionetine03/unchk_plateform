package com.unchk.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Stocke les fichiers joints (comptes rendus, documents) sur le disque,
 * dans le repertoire configure par "app.upload.dir" (par defaut: ./uploads).
 */
@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path racine;

    @PostConstruct
    public void init() {
        try {
            this.racine = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(this.racine);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de creer le repertoire de stockage des fichiers.", e);
        }
    }

    /** Enregistre le fichier et retourne le nom de stockage unique. */
    public String enregistrer(MultipartFile fichier) {
        if (fichier == null || fichier.isEmpty()) {
            throw new IllegalArgumentException("Fichier vide.");
        }
        String nomOriginal = StringUtils.cleanPath(
                fichier.getOriginalFilename() == null ? "fichier" : fichier.getOriginalFilename());
        String nomStockage = UUID.randomUUID() + "_" + nomOriginal;
        try {
            Path cible = this.racine.resolve(nomStockage).normalize();
            if (!cible.getParent().equals(this.racine)) {
                throw new IllegalArgumentException("Chemin de fichier non autorise.");
            }
            Files.copy(fichier.getInputStream(), cible, StandardCopyOption.REPLACE_EXISTING);
            return nomStockage;
        } catch (IOException e) {
            throw new RuntimeException("Echec de l'enregistrement du fichier " + nomOriginal, e);
        }
    }

    /** Charge un fichier stocke en tant que ressource telechargeable. */
    public Resource charger(String nomStockage) {
        try {
            Path fichier = this.racine.resolve(nomStockage).normalize();
            Resource resource = new UrlResource(fichier.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new RuntimeException("Fichier introuvable : " + nomStockage);
        } catch (MalformedURLException e) {
            throw new RuntimeException("Fichier introuvable : " + nomStockage, e);
        }
    }

    /** Supprime un fichier stocke (silencieux si absent). */
    public void supprimer(String nomStockage) {
        if (nomStockage == null) return;
        try {
            Files.deleteIfExists(this.racine.resolve(nomStockage).normalize());
        } catch (IOException ignored) {
        }
    }
}
