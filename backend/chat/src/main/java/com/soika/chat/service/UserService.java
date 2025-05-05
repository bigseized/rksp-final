package com.soika.chat.service;

import com.soika.chat.model.entity.User;
import com.soika.chat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow();
    }

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
        log.debug("Updating user avatar");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setAvatar(avatarPath);
        userRepository.save(user);
    }

    public String getCurrentAvatar(Long userId) {
        return userRepository.findById(userId)
                .map(User::getAvatar)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.BAD_REQUEST, "User or image are not found"));
    }
}
