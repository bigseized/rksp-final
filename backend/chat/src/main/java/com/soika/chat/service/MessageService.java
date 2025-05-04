package com.soika.chat.service;

import com.soika.chat.model.dto.ChatMessageDto;
import com.soika.chat.model.entity.Chat;
import com.soika.chat.model.entity.ChatMessage;
import com.soika.chat.repository.ChatMessageRepository;
import com.soika.chat.repository.ChatRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class MessageService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ChatRepository chatRepository;

    @Transactional
    public ChatMessageDto sendMessage(Long chatId, String content, String sender) {
        log.info("Looking for chat with id: {}", chatId);
        Chat chat = chatRepository.findById(chatId)
            .orElseThrow(() -> {
                log.error("Chat not found with id: {}", chatId);
                return new RuntimeException("Chat not found");
            });

        log.info("Creating new message for chat {} from sender {}", chatId, sender);
        ChatMessage message = new ChatMessage();
        message.setChat(chat);
        message.setSender(sender);
        message.setContent(content);
        
        log.info("Saving message to database");
        message = chatMessageRepository.save(message);
        
        log.info("Converting message to DTO");
        return ChatMessageDto.fromEntity(message);
    }
} 