package org.soika.auth_provider.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ValidateTokenResponse {
    private boolean valid;
    private String username;
    private String error;
    private Long id;
} 