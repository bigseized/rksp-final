package com.soika.chat.model.dto;

import com.soika.chat.model.entity.ChatMessage;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChatMessageDto {
    private Long id;
    private Long chatId;
    private String sender;
    private String content;
    private LocalDateTime timestamp;

    public static ChatMessageDto fromEntity(ChatMessage entity) {
        ChatMessageDto dto = new ChatMessageDto();
        dto.setId(entity.getId());
        dto.setChatId(entity.getChat().getId());
        dto.setSender(entity.getSender());
        dto.setContent(entity.getContent());
        dto.setTimestamp(entity.getTimestamp());
        return dto;
    }
} 