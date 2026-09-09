package com.medisphere.security;

import java.io.IOException;
import java.util.List;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtService jwtService;

    public SecurityConfig(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =========================================================
    // CORS CONFIGURATION
    // =========================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:4200",
                "http://127.0.0.1:4200"
        ));

        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        config.setAllowedHeaders(List.of("*"));

        config.setAllowCredentials(true);

        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    // =========================================================
    // SECURITY FILTER CHAIN
    // =========================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

            // REST API ke liye CSRF disable
            .csrf(csrf -> csrf.disable())

            // CORS enable
            .cors(cors -> {})

            // JWT based stateless authentication
            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )

            // =================================================
            // AUTHORIZATION RULES
            // =================================================

            .authorizeHttpRequests(auth -> auth

                // ---------------------------------------------
                // PUBLIC ENDPOINTS
                // ---------------------------------------------

                .requestMatchers(
                        "/api/auth/**",
                        "/api/fhir/**",
                        "/actuator/health",
                        "/error"
                ).permitAll()

                // ---------------------------------------------
                // CORS PREFLIGHT
                // ---------------------------------------------

                .requestMatchers(
                        HttpMethod.OPTIONS,
                        "/**"
                ).permitAll()

                // ---------------------------------------------
                // EVERYTHING ELSE
                // JWT REQUIRED
                // ---------------------------------------------

                .anyRequest().authenticated()
            )

            // =================================================
            // JWT FILTER
            // =================================================

            .addFilterBefore(
                    new JwtFilter(jwtService),
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    // =========================================================
    // JWT FILTER
    // =========================================================

    static class JwtFilter extends OncePerRequestFilter {

        private final JwtService jwtService;

        JwtFilter(JwtService jwtService) {
            this.jwtService = jwtService;
        }

        @Override
        protected void doFilterInternal(
                HttpServletRequest request,
                HttpServletResponse response,
                FilterChain filterChain)
                throws ServletException, IOException {

            String header =
                    request.getHeader("Authorization");

            // ---------------------------------------------
            // Authorization header check
            // ---------------------------------------------

            if (header != null &&
                    header.startsWith("Bearer ")) {

                String token =
                        header.substring(7);

                try {

                    // -----------------------------------------
                    // Parse JWT
                    // -----------------------------------------

                    var claims =
                            jwtService.parse(token);

                    String username =
                            claims.getSubject();

                    String role =
                            claims.get(
                                    "role",
                                    String.class
                            );

                    // -----------------------------------------
                    // Create Authentication
                    // -----------------------------------------

                    if (
                            username != null &&
                            SecurityContextHolder
                                    .getContext()
                                    .getAuthentication() == null
                    ) {

                        List<SimpleGrantedAuthority> authorities;

                        if (role == null || role.isBlank()) {

                            authorities = List.of();

                        } else {

                            String authority =
                                    role.startsWith("ROLE_")
                                            ? role
                                            : "ROLE_" + role;

                            authorities =
                                    List.of(
                                            new SimpleGrantedAuthority(
                                                    authority
                                            )
                                    );
                        }

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        username,
                                        null,
                                        authorities
                                );

                        SecurityContextHolder
                                .getContext()
                                .setAuthentication(
                                        authentication
                                );
                    }

                } catch (Exception ignored) {

                    // Invalid / expired JWT.
                    // Request will continue without authentication.
                }
            }

            // ---------------------------------------------
            // Continue filter chain
            // ---------------------------------------------

            filterChain.doFilter(
                    request,
                    response
            );
        }
    }
}