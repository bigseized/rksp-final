package com.soika.chat.repository;

import com.soika.chat.model.ChatRole;
import com.soika.chat.model.entity.Chat;
import com.soika.chat.model.entity.User;
import com.soika.chat.model.entity.UserChat;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserChatRepository extends JpaRepository<UserChat, Long> {
    Optional<UserChat> findByUserAndChat(User user, Chat chat);
    boolean existsByUserAndChat(User user, Chat chat);
    List<UserChat> findByChat(Chat user);
    long countAllByRoleAndChat(ChatRole role, Chat chat);
    @EntityGraph(attributePaths = {"chat", "chat.userChats", "chat.userChats.user"})
    List<UserChat> findByUserId(Long userId);

    @Query("SELECT uc.user FROM UserChat uc WHERE uc.user.id != :userId AND uc.chat = :chat")
    Optional<User> findByChatIdAndNotUserId(Long userId, Chat chat);

    @Query("""
        SELECT uc.chat 
        FROM UserChat uc 
        JOIN uc.chat c 
        WHERE uc.user.id IN (:userId1, :userId2)
        AND c.isPersonal = true
        GROUP BY uc.chat
        HAVING COUNT(DISTINCT uc.user) = 2
        """)
    List<Chat> findPersonalChatBetweenUsers(
            @Param("userId1") Long userId1,
            @Param("userId2") Long userId2
    );

}