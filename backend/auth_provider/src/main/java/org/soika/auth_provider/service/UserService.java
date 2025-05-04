package org.soika.auth_provider.service;

import lombok.RequiredArgsConstructor;
import org.soika.auth_provider.model.User;
import org.soika.auth_provider.model.UserRole;
import org.soika.auth_provider.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public User loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
    }
    
    public User createUser(String email, String password, String username) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        var user = new User(
            email,
            passwordEncoder.encode(password),
            username,
            UserRole.USER
        );
        
        return userRepository.save(user);
    }
    
    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
    }
    
    public User updateUser(Long id, String username) {
        var user = getUser(id);
        user.setUsername(username);
        return userRepository.save(user);
    }
    
    public User addRole(Long userId, UserRole role) {
        var user = getUser(userId);
        user.setRole(role);
        return userRepository.save(user);
    }
} 