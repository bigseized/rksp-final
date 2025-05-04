package com.soika.chat.service;

import com.soika.chat.model.entity.User;
import com.soika.chat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public List<User> searchUsers(String query) {
        return userRepository.findMatchingByUsername(query);
    }

    @Transactional
    public void updateUsername(Long userId, String username) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setUsername(username);
        userRepository.save(user);
    }

    @Transactional
    public void updateAvatar(Long userId, String avatarPath) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setAvatar(avatarPath);
        userRepository.save(user);
    }

    public String getCurrentAvatar(Long userId) {
        return userRepository.findById(userId)
                .map(User::getAvatar)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
