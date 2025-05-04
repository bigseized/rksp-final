package com.soika.chat.dto;

import lombok.Data;

@Data
public class ValidateTokenResponse {
    private boolean valid;
    private String username;
    private String error;
    private Long id;
}