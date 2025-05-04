package com.soika.chat.controller;

import com.soika.chat.model.dto.UserSearchDto;
import com.soika.chat.model.entity.User;
import com.soika.chat.service.S3Service;
import com.soika.chat.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final S3Service s3Service;

    @GetMapping("/search")
    public ResponseEntity<List<UserSearchDto>> searchUsers(@RequestParam String query) {
        List<User> users = userService.searchUsers(query);
        List<UserSearchDto> result = users.stream()
            .map(user -> new UserSearchDto(
                user.getId(),
                user.getUsername(),
                user.getRole()
            ))
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{userId}/username")
    public ResponseEntity<?> updateUsername(@PathVariable Long userId, @RequestParam String username) {
        userService.updateUsername(userId, username);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/avatar")
    public ResponseEntity<?> uploadAvatar(@PathVariable Long userId, @RequestParam("file") MultipartFile file) {
        try {
            String fileName = s3Service.uploadFile(file);
            userService.updateAvatar(userId, fileName);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to upload avatar");
        }
    }

    @DeleteMapping("/{userId}/avatar")
    public ResponseEntity<?> deleteAvatar(@PathVariable Long userId) {
        try {
            String currentAvatar = userService.getCurrentAvatar(userId);
            if (currentAvatar != null) {
                s3Service.deleteFile(currentAvatar);
                userService.updateAvatar(userId, null);
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete avatar");
        }
    }
} 