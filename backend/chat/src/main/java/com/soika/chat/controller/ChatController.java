package com.soika.chat.controller;

import com.soika.chat.model.ChatRole;
import com.soika.chat.model.dto.ChatDto;
import com.soika.chat.model.dto.ChatMessageDto;
import com.soika.chat.model.dto.PersonalChatDto;
import com.soika.chat.model.dto.UserDto;
import com.soika.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);
    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatDto> createChat(@RequestBody ChatDto chatDto, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        ChatDto createdChat = chatService.createChat(chatDto, userId);

        return ResponseEntity.ok(createdChat);
    }

    @PostMapping("/personal")
    public ResponseEntity<ChatDto> createPersonalChat(@RequestBody PersonalChatDto chatDto, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        ChatDto createdChat;

        try {
             createdChat = chatService.createPersonalChat(chatDto, userId);
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).build();
        }

        return ResponseEntity.ok(createdChat);
    }

    @GetMapping
    public ResponseEntity<List<ChatDto>> getUserChats(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        log.info("getUserChats: {}", userId);
        List<ChatDto> chats = chatService.getUserChats(userId);
        return ResponseEntity.ok(chats);
    }


    @GetMapping("/{chatId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getChatMessages(
            @PathVariable Long chatId,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());
        log.debug(userId + " " + chatId);
        if (!chatService.isUserInChat(userId, chatId)) {
            return ResponseEntity.status(403).build();
        }

        List<ChatMessageDto> messages = chatService.getChatHistory(chatId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{chatId}/messages")
    public ResponseEntity<ChatMessageDto> sendMessage(
            @PathVariable Long chatId,
            @RequestBody ChatMessageDto messageDto,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());
        if (!chatService.isUserInChat(userId, chatId)) {
            return ResponseEntity.status(403).build();
        }

        ChatMessageDto sentMessage = chatService.sendMessage(
                chatId,
                authentication.getName(),
                messageDto.getContent()
        );
        return ResponseEntity.ok(sentMessage);
    }

    @GetMapping("/{chatId}/members")
    public ResponseEntity<List<UserDto>> getChatMembers(
            @PathVariable Long chatId,
            Authentication authentication
    ) {
        Long currentUserId = Long.parseLong(authentication.getName());

        if (!chatService.isUserInChat(currentUserId, chatId)) {
            return ResponseEntity.status(403).build();
        }

        List<UserDto> dtos = chatService.getChatMembers(chatId);

        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{chatId}/users/{userId}")
    public ResponseEntity<Void> addUserToChat(
            @PathVariable Long chatId,
            @PathVariable Long userId,
            Authentication authentication
    ) {
        Long currentUserId = Long.parseLong(authentication.getName());
        if (!chatService.getUserRoleInChat(currentUserId, chatId).equals(ChatRole.ADMIN)) {
            return ResponseEntity.status(403).build();
        }

        chatService.addUserToChat(chatId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{chatId}/users/me")
    public ResponseEntity<Void> leaveChat(
            @PathVariable Long chatId,
            Authentication authentication
    ) {
        Long currentUserId = Long.parseLong(authentication.getName());

        try {
            chatService.leaveFromChat(chatId, currentUserId);
        } catch (HttpClientErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).build();
        }

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{chatId}/users/{userId}")
    public ResponseEntity<Void> deleteUserFromChat(
            @PathVariable Long chatId,
            @PathVariable Long userId,
            Authentication authentication
    ) {
        Long currentUserId = Long.parseLong(authentication.getName());
        if (!chatService.getUserRoleInChat(currentUserId, chatId).equals(ChatRole.ADMIN)) {
            return ResponseEntity.status(403).build();
        }

        chatService.deleteUserFromChat(chatId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{chatId}/users/{userId}/demote")
    public ResponseEntity<Void> demoteUserFromChat(
            @PathVariable Long chatId,
            @PathVariable Long userId,
            Authentication authentication
    ) {
        Long currentUserId = Long.parseLong(authentication.getName());
        if (!chatService.getUserRoleInChat(currentUserId, chatId).equals(ChatRole.ADMIN)) {
            return ResponseEntity.status(403).build();
        }

        chatService.demoteUserFromChat(chatId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{chatId}/users/{userId}/promote")
    public ResponseEntity<Void> promoteUserFromChat(
            @PathVariable Long chatId,
            @PathVariable Long userId,
            Authentication authentication
    ) {
        Long currentUserId = Long.parseLong(authentication.getName());
        if (!chatService.getUserRoleInChat(currentUserId, chatId).equals(ChatRole.ADMIN)) {
            return ResponseEntity.status(403).build();
        }

        chatService.promoteUserFromChat(chatId, userId);
        return ResponseEntity.ok().build();
    }
}
