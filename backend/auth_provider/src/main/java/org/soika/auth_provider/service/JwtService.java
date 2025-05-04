package org.soika.auth_provider.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.soika.auth_provider.dto.ValidateTokenRequest;
import org.soika.auth_provider.dto.ValidateTokenResponse;
import org.soika.auth_provider.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@Slf4j
public class JwtService {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration = 86400000; // 24 hours
    
    public String generateToken(User userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim("authorities", userDetails.getAuthorities())
                .claim("id", userDetails.getId())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(Keys.hmacShaKeyFor(secret.getBytes()), SignatureAlgorithm.HS512)
                .compact();
    }
    
    public boolean validateToken(String token, UserDetails userDetails) {
        Claims claims = extractAllClaims(token);
        String username = claims.getSubject();
        Date expiration = claims.getExpiration();
        return username.equals(userDetails.getUsername()) && !expiration.before(new Date());
    }

    public ValidateTokenResponse validateToken(ValidateTokenRequest request) {
        try {
            Claims claims = extractAllClaims(request.getToken());
            return ValidateTokenResponse.builder()
                    .valid(true)
                    .username(claims.getSubject())
                    .id(claims.get("id", Long.class))
                    .build();
        } catch (Exception e) {
            log.error(e.getMessage());
            return ValidateTokenResponse.builder()
                    .valid(false)
                    .error(e.getMessage())
                    .build();
        }
    }
    
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }
    
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes()))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
} 