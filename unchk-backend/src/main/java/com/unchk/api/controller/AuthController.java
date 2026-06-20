package com.unchk.api.controller;

import com.unchk.api.entity.Utilisateur;
import com.unchk.api.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String motDePasse = body.get("motDePasse");

        return utilisateurRepository.findByEmail(email)
            .filter(u -> passwordEncoder.matches(motDePasse, u.getMotDePasse()))
            .map(u -> {
                String token = Jwts.builder()
                    .setSubject(u.getEmail())
                    .claim("role", u.getRole())
                    .claim("nom", u.getNom())
                    .claim("prenom", u.getPrenom())
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                    .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS256)
                    .compact();

                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("role", u.getRole());
                response.put("nom", u.getNom());
                response.put("prenom", u.getPrenom());
                response.put("email", u.getEmail());
                return ResponseEntity.ok(response);
            })
            .orElse(ResponseEntity.status(401).build());
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Utilisateur utilisateur) {
        if (utilisateurRepository.existsByEmail(utilisateur.getEmail())) {
            return ResponseEntity.badRequest().body("Email deja utilise");
        }
        utilisateur.setMotDePasse(passwordEncoder.encode(utilisateur.getMotDePasse()));
        Utilisateur saved = utilisateurRepository.save(utilisateur);
        saved.setMotDePasse(null);
        return ResponseEntity.ok(saved);
    }
}
