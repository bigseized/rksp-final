package com.soika.chat.controller;

import com.soika.chat.config.ws_security.WebSocketAuthContext;
import com.soika.chat.model.dto.ChatMessageDto;
import com.soika.chat.service.MessageService;
import com.soika.chat.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.annotation.SendToUser;

@Controller
@Slf4j
@RequiredArgsConstructor
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    private final WebSocketAuthContext authContext;
    private final UserService userService;

    @MessageMapping("/chat/{chatId}/sendMessage")
    public void sendMessage(
            @DestinationVariable Long chatId,
            @Payload ChatMessageDto messageDto,
            SimpMessageHeaderAccessor headerAccessor) {

        String sessionId = headerAccessor.getSessionId();
        Authentication auth = authContext.get(sessionId);

        if (auth == null) {
            throw new AuthenticationCredentialsNotFoundException("Not authenticated");
        }

        if (messageDto == null || messageDto.getContent() == null || messageDto.getContent().trim().isEmpty()) {
            log.error("Invalid message content");
            throw new IllegalArgumentException("Message content cannot be empty");
        }

        try {
            log.info("Processing message in MessageService");
            ChatMessageDto response = messageService.sendMessage(
                chatId,
                messageDto.getContent(),
                authContext.getUserId(sessionId),
                auth.getName()
            );
            
            log.info("Sending response to /topic/chat/{}", chatId);
            messagingTemplate.convertAndSend("/topic/chat/" + chatId, response);
            log.info("Message sent successfully");
        } catch (Exception e) {
            log.error("Error sending message: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send message: " + e.getMessage());
        }
    }

    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public String handleException(Throwable exception) {
        log.error("WebSocket error: {}", exception.getMessage(), exception);
        return exception.getMessage();
    }
} 