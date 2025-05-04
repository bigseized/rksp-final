package com.soika.chat.model.dto;

import com.soika.chat.model.ChatRole;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private ChatRole role;
}
