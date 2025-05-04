package com.soika.chat.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PersonalChatDto {
    private Long id;
    private String name;
    private String description;
    @JsonProperty("personal")
    private boolean isPersonal;
    @JsonProperty("targetUserId")
    private Long targetId;
}