package com.soika.chat.model.entity;

import com.soika.chat.model.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    private String password;

    @Column(nullable = false, unique = true)
    private String username;

    @Column
    private String avatar;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    public User() {}

    public User(String email, String password, String username, UserRole role) {
        this.email = email;
        this.password = password;
        this.username = username;
        this.role = role;
    }

    public String getDisplayUsername() {
        return username;
    }
} 