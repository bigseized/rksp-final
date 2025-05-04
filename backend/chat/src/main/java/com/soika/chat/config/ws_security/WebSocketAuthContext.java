package com.soika.chat.config.ws_security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class WebSocketAuthContext {
    private final ConcurrentMap<String, Authentication> sessions = new ConcurrentHashMap<>();

    public void register(String sessionId, Authentication auth) {
        sessions.put(sessionId, auth);
    }

    public Authentication get(String sessionId) {
        return sessions.get(sessionId);
    }

    public void remove(String sessionId) {
        sessions.remove(sessionId);
    }
}