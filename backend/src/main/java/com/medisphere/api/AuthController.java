package com.medisphere.api;

import com.medisphere.model.Models.User;
import com.medisphere.repo.UserRepo;
import com.medisphere.security.JwtService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    record Login(@NotBlank String identifier, @NotBlank String password) {}

    private final UserRepo users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UserRepo users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users; this.encoder = encoder; this.jwt = jwt;
    }

    @PostMapping("/login")
    public Map<String,Object> login(@RequestBody Login body) {
        String identifier = body.identifier().trim();
        User u = users.findByUsername(identifier)
                .or(() -> users.findByEmail(identifier))
                .orElseThrow(() -> new RuntimeException("Invalid username/email or password"));
        if (!u.active || !encoder.matches(body.password(), u.password)) {
            throw new RuntimeException("Invalid username/email or password");
        }
        return Map.of(
                "token", jwt.create(u.email, u.role),
                "user", Map.of("id", u.id, "name", u.name, "username", u.username == null ? "" : u.username, "email", u.email, "role", u.role)
        );
    }
}
