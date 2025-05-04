package com.soika.chat.client;

import com.soika.chat.dto.ValidateTokenRequest;

import com.soika.chat.dto.ValidateTokenResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class AuthClient {
    private final RestTemplate restTemplate;
    private final String authServiceUrl;

    public AuthClient(RestTemplate restTemplate, @Value("${auth.service.url}") String authServiceUrl) {
        this.restTemplate = restTemplate;
        this.authServiceUrl = authServiceUrl;
    }

    public ValidateTokenResponse validateToken(String token) {
        ValidateTokenRequest request = new ValidateTokenRequest();
        request.setToken(token);
        
        return restTemplate.postForObject(
                authServiceUrl + "/api/auth/validate",
                request,
                ValidateTokenResponse.class
        );
    }
} 