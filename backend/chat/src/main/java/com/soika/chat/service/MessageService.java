package com.soika.chat.service;

import com.soika.chat.model.dto.ChatMessageDto;
import com.soika.chat.model.entity.Chat;
import com.soika.chat.model.entity.ChatMessage;
import com.soika.chat.model.entity.User;
import com.soika.chat.repository.ChatMessageRepository;
import com.soika.chat.repository.ChatRepository;
import com.soika.chat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public ChatMessageDto sendMessage(Long chatId, String content, Long senderId, String email) {
        log.info("Looking for chat with id: {}", chatId);
        User user = userService.getUserById(senderId);


        Chat chat = chatRepository.findById(chatId)
            .orElseThrow(() -> {
                log.error("Chat not found with id: {}", chatId);
                return new RuntimeException("Chat not found");
            });

        log.info("Creating new message for chat {} from sender {}", chatId, user.getUsername());
        ChatMessage message = new ChatMessage();
        message.setChat(chat);
        message.setSender(user.getUsername());
        message.setContent(content);
        message.setUser(user);

        log.info("Saving message to database");
        message = chatMessageRepository.save(message);
        
        log.info("Converting message to DTO");
        ChatMessageDto chatMessageDto = ChatMessageDto.fromEntity(message);
        chatMessageDto.setEmail(email);
        return chatMessageDto;
    }
} 