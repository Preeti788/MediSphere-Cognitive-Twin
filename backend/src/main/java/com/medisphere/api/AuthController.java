package com.medisphere.api;

import com.medisphere.model.Models.User;
import com.medisphere.repo.UserRepo;
import com.medisphere.security.JwtService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    record Login(@NotBlank String username, @NotBlank String password) {}
    record Register(@NotBlank String name, @NotBlank String username, @Email @NotBlank String email, @NotBlank String password) {}

    private final UserRepo users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UserRepo users, PasswordEncoder encoder, JwtService jwt){
        this.users=users; this.encoder=encoder; this.jwt=jwt;
    }

    @PostMapping("/login")
    public Map<String,Object> login(@RequestBody Login body) {
        String key = body.username().trim();
        User u = (key.contains("@") ? users.findByEmail(key) : users.findByUsername(key))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));
        if(!u.active || !encoder.matches(body.password(),u.password))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        return Map.of("token",jwt.create(u.email,u.role),"user",Map.of("id",u.id,"name",u.name,"username",u.username == null ? "" : u.username,"email",u.email,"role",u.role));
    }

    @PostMapping("/register")
    public Map<String,Object> register(@RequestBody Register body) {
        String username=body.username().trim().toLowerCase();
        String email=body.email().trim().toLowerCase();
        if(users.existsByUsername(username) || users.existsByEmail(email))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username or email already exists");
        if(body.password().length()<8)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must contain at least 8 characters");

        User u=new User();
        u.name=body.name().trim();
        u.username=username;
        u.email=email;
        u.password=encoder.encode(body.password());
        u.role="RECEPTIONIST";
        u.active=true;
        users.save(u);
        return Map.of("message","Account created","user",Map.of("id",u.id,"name",u.name,"username",u.username,"email",u.email,"role",u.role));
    }
}
