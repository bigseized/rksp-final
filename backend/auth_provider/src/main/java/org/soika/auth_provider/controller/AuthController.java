package org.soika.auth_provider.controller;

import org.soika.auth_provider.dto.*;
import org.soika.auth_provider.model.User;
import org.soika.auth_provider.service.JwtService;
import org.soika.auth_provider.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;

    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        var user = userService.loadUserByUsername(request.getEmail());
        var token = jwtService.generateToken(user);
        
        return ResponseEntity.ok(new AuthResponse(token, user));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        var user = userService.createUser(
            request.getEmail(),
            request.getPassword(),
            request.getUsername()
        );
        var token = jwtService.generateToken(user);
        
        return ResponseEntity.ok(new AuthResponse(token, user));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        var token = authHeader.substring(7);
        var username = jwtService.extractUsername(token);
        var user = userService.loadUserByUsername(username);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/validate")
    public ResponseEntity<ValidateTokenResponse> validateToken(@RequestBody ValidateTokenRequest request) {
        return ResponseEntity.ok(jwtService.validateToken(request));
    }
} 