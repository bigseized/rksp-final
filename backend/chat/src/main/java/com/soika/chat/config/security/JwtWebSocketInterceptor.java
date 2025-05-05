package com.soika.chat.config.security;

import com.soika.chat.client.AuthClient;
import com.soika.chat.config.ws_security.WebSocketAuthContext;
import com.soika.chat.dto.ValidateTokenResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import java.util.Collections;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtWebSocketInterceptor implements ChannelInterceptor {

    private final WebSocketAuthContext authContext;
    private final AuthClient authClient;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = extractToken(accessor);
            ValidateTokenResponse response = authClient.validateToken(token);

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    response.getUsername(),
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
            );

            authContext.register(accessor.getSessionId(), auth);
            authContext.setUserId(accessor.getSessionId(), response.getId());
        } else if (StompCommand.DISCONNECT.equals(accessor.getCommand())) {
            authContext.remove(accessor.getSessionId());
            authContext.removeUserId(accessor.getSessionId());
        }

        return message;
    }

    private String extractToken(StompHeaderAccessor accessor) {
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}