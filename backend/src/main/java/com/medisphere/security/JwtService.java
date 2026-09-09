package com.medisphere.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtService {
    private final SecretKey key;
    private final long expiration;
    public JwtService(@Value("${medisphere.jwt-secret}") String secret,
                      @Value("${medisphere.jwt-expiration-ms}") long expiration) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
    }
    public String create(String email, String role) {
        return Jwts.builder().subject(email).claim("role", role)
            .issuedAt(new java.util.Date()).expiration(new java.util.Date(System.currentTimeMillis()+expiration))
            .signWith(key).compact();
    }
    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}
