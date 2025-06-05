package org.soika.auth_provider;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.soika.auth_provider.model.User;
import org.soika.auth_provider.model.UserRole;
import org.soika.auth_provider.repository.UserRepository;
import org.soika.auth_provider.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void createUser_Success() {
        // Arrange
        String email = "testuser";
        String password = "password";
        String username = "testuser";
        String encodedPassword = "encodedPassword";

        when(userRepository.existsByEmail(email)).thenReturn(false);
        when(passwordEncoder.encode(password)).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        User result = userService.createUser(email, password, username);

        // Assert
        assertNotNull(result);
        assertEquals(email, result.getEmail());
        assertEquals(encodedPassword, result.getPassword());
        assertEquals(username, result.getUsername());

        verify(userRepository).existsByEmail(email);
        verify(passwordEncoder).encode(password);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUser_WhenEmailExists_ShouldThrowException() {
        String email = "existing@example.com";
        String password = "password";
        String username = "existinguser";

        when(userRepository.existsByEmail(email)).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.createUser(email, password, username));

        assertEquals("Email already exists", exception.getMessage());

        verify(userRepository).existsByEmail(email);
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void loadUserByUsername_WhenUserExists_ShouldReturnUser() {
        String email = "user@example.com";
        User expectedUser = new User(email, "encodedPass", "username", UserRole.USER);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(expectedUser));
        User result = userService.loadUserByUsername(email);

        assertNotNull(result);
        assertEquals(expectedUser, result);
        verify(userRepository).findByEmail(email);
    }

}