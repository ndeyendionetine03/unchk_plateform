package com.unchk.api.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Pré-vol CORS
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Routes publiques (login / register)
                .requestMatchers("/api/auth/**").permitAll()

                // ---- LECTURE des modules sensibles : restreinte ----
                .requestMatchers(HttpMethod.GET, "/api/budgets/**").hasAnyRole("admin", "administratif")
                .requestMatchers(HttpMethod.GET, "/api/partenaires/**").hasAnyRole("admin", "administratif", "insertion")

                // ---- LECTURE : tout utilisateur authentifié peut consulter ----
                .requestMatchers(HttpMethod.GET, "/api/**").authenticated()

                // ---- ÉCRITURE (POST/PUT/DELETE) : restreinte par rôle ----
                // Budget : administration
                .requestMatchers("/api/budgets/**").hasAnyRole("admin", "administratif")
                // Partenaires & insertion : appui à l'insertion + administration
                .requestMatchers("/api/partenaires/**").hasAnyRole("admin", "administratif", "insertion")
                .requestMatchers("/api/insertions/**").hasAnyRole("admin", "administratif", "insertion")
                // Dossiers étudiants / formations / formateurs : administration
                .requestMatchers("/api/etudiants/**").hasAnyRole("admin", "administratif")
                .requestMatchers("/api/formations/**").hasAnyRole("admin", "administratif")
                .requestMatchers("/api/formateurs/**").hasAnyRole("admin", "administratif")
                // Emplois du temps : administration + enseignants
                .requestMatchers("/api/emplois-du-temps/**").hasAnyRole("admin", "administratif", "enseignant")
                // Communication : administration + enseignants
                .requestMatchers("/api/documents/**").hasAnyRole("admin", "administratif", "enseignant")
                .requestMatchers("/api/comptes-rendus/**").hasAnyRole("admin", "administratif", "enseignant")

                // Tout le reste nécessite une authentification
                .anyRequest().authenticated()
            )
            // Le filtre JWT valide le jeton et alimente le contexte de sécurité
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
