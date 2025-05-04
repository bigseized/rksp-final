package com.soika.chat.repository;

import com.soika.chat.model.entity.Chat;
import com.soika.chat.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
}