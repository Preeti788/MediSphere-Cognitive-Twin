package com.medisphere.api;

import com.medisphere.model.Models.User;
import com.medisphere.repo.UserRepo;
import com.medisphere.security.JwtService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    record Login(@Email String email, @NotBlank String password) {}
    private final UserRepo users; private final PasswordEncoder encoder; private final JwtService jwt;
    public AuthController(UserRepo users, PasswordEncoder encoder, JwtService jwt){this.users=users;this.encoder=encoder;this.jwt=jwt;}

    @PostMapping("/login")
    public Map<String,Object> login(@RequestBody Login body) {
        var u=users.findByEmail(body.email()).orElseThrow(() -> new RuntimeException("Invalid email or password"));
        if(!u.active || !encoder.matches(body.password(),u.password)) throw new RuntimeException("Invalid email or password");
        return Map.of("token",jwt.create(u.email,u.role),"user",Map.of("id",u.id,"name",u.name,"email",u.email,"role",u.role));
    }
}
