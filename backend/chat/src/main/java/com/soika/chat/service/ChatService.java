package com.soika.chat.service;

import com.soika.chat.model.ChatRole;
import com.soika.chat.model.dto.ChatDto;
import com.soika.chat.model.dto.ChatMessageDto;
import com.soika.chat.model.dto.PersonalChatDto;
import com.soika.chat.model.dto.UserDto;
import com.soika.chat.model.entity.Chat;
import com.soika.chat.model.entity.ChatMessage;
import com.soika.chat.model.entity.User;
import com.soika.chat.model.entity.UserChat;
import com.soika.chat.repository.ChatRepository;
import com.soika.chat.repository.ChatMessageRepository;
import com.soika.chat.repository.UserChatRepository;
import com.soika.chat.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    private final UserChatRepository userChatRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void addUserToChat(Long chatId, Long userId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new EntityNotFoundException("Chat not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (userChatRepository.existsByUserAndChat(user, chat)) {
            throw new IllegalStateException("User is already a member of this chat");
        }

        UserChat userChat = new UserChat(user, chat, ChatRole.MEMBER);
        userChatRepository.save(userChat);
    }

    @Transactional
    public void leaveFromChat(Long chatId, Long selfId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new EntityNotFoundException("Chat not found"));

        User user = userRepository.findById(selfId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        UserChat userChat = userChatRepository.findByUserAndChat(user, chat)
                .orElseThrow(() -> new EntityNotFoundException("User is not a member of this chat"));

        if (userChat.getRole().equals(ChatRole.ADMIN) &&
            userChatRepository.countAllByRoleAndChat(ChatRole.ADMIN, chat) < 2) {
            throw new HttpClientErrorException(HttpStatusCode.valueOf(409));
        }

        userChatRepository.delete(userChat);
    }
    @Transactional
    public void deleteUserFromChat(Long chatId, Long userId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new EntityNotFoundException("Chat not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        UserChat userChat = userChatRepository.findByUserAndChat(user, chat)
                .orElseThrow(() -> new EntityNotFoundException("User is not a member of this chat"));

        if (userChat.getRole().equals(ChatRole.ADMIN)) {
            throw new IllegalStateException("Cannot delete admin from chat, first demote");
        }

        userChatRepository.delete(userChat);
    }

    @Transactional
    public void promoteUserFromChat(Long chatId, Long userId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new EntityNotFoundException("Chat not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        UserChat userChat = userChatRepository.findByUserAndChat(user, chat)
                .orElseThrow(() -> new EntityNotFoundException("User is not a member of this chat"));

        userChat.setRole(ChatRole.ADMIN);

        userChatRepository.save(userChat);
    }

    @Transactional
    public void demoteUserFromChat(Long chatId, Long userId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new EntityNotFoundException("Chat not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        UserChat userChat = userChatRepository.findByUserAndChat(user, chat)
                .orElseThrow(() -> new EntityNotFoundException("User is not a member of this chat"));

        userChat.setRole(ChatRole.MEMBER);

        userChatRepository.save(userChat);
    }

    @Transactional(readOnly = true)
    public List<ChatDto> getUserChats(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        List<UserChat> userChats = userChatRepository.findByUserId(userId);

        return userChats.stream()
                .map(userChat -> {
                    Chat chat = userChat.getChat();
                    ChatDto dto = new ChatDto();
                    dto.setId(chat.getId());
                    dto.setPersonal(chat.getIsPersonal());

                    if (chat.getIsPersonal()) {
                        User targetUser = userChatRepository.findByChatIdAndNotUserId(userId, chat).orElse(user);
                        dto.setName(targetUser.getUsername());
                        dto.setInterlocutorId(targetUser.getId());
                    } else {
                        dto.setName(chat.getName());
                        dto.setDescription(chat.getDescription());
                    }

                    return dto;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean isUserInChat(Long userId, Long chatId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new EntityNotFoundException("Chat not found"));

        return userChatRepository.existsByUserAndChat(user, chat);
    }

    @Transactional(readOnly = true)
    public ChatRole getUserRoleInChat(Long userId, Long chatId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new EntityNotFoundException("Chat not found"));

        return userChatRepository.findByUserAndChat(user, chat)
                .map(UserChat::getRole)
                .orElseThrow(() -> new EntityNotFoundException("User is not a member of this chat"));
    }

    public ChatDto createChat(ChatDto chatDto, Long userId) {
        Chat chat = new Chat(chatDto.getName(), chatDto.getDescription(), chatDto.isPersonal());
        chat = chatRepository.save(chat);
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        userChatRepository.save(new UserChat(user, chat, ChatRole.ADMIN));
        return convertToDto(chat);
    }

    @Transactional
    public ChatDto createPersonalChat(PersonalChatDto chatDto, Long userId) {
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        User target = userRepository.findById(chatDto.getTargetId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (creator.equals(target)) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Cannot create chat with yourself");
        }

        List<Chat> existingChat = userChatRepository.findPersonalChatBetweenUsers(
                creator.getId(),
                target.getId()
        );

        if (!existingChat.isEmpty()) {
            throw new HttpClientErrorException(
                    HttpStatus.CONFLICT,
                    "Personal chat between these users already exists. Chat ID's: " + existingChat
            );
        }

        Chat chat = new Chat();
        chat.setName(chatDto.getName());
        chat.setDescription(chatDto.getDescription());
        chat.setIsPersonal(true);
        chat = chatRepository.save(chat);

        userChatRepository.save(new UserChat(creator, chat, ChatRole.ADMIN));
        userChatRepository.save(new UserChat(target, chat, ChatRole.ADMIN));

        return convertToDto(chat);
    }

    public ChatMessageDto sendMessage(Long chatId, String sender, String content) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        ChatMessage message = new ChatMessage();
        message.setChat(chat);
        message.setSender(sender);
        message.setContent(content);
        message = chatMessageRepository.save(message);

        messagingTemplate.convertAndSend("/topic/chat/" + chatId, convertToMessageDto(message));

        return convertToMessageDto(message);
    }

    public List<ChatMessageDto> getChatHistory(Long chatId) {
        if (!chatRepository.existsById(chatId)) {
            throw new RuntimeException("Chat not found");
        }

        return chatMessageRepository.findTop100ByChatIdOrderByTimestampAsc(chatId).stream()
                .map(this::convertToMessageDto)
                .collect(Collectors.toList());
    }

    public List<UserDto> getChatMembers(Long chatId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

       List<UserChat> userChats = userChatRepository.findByChat(chat);

       return userChats.stream().map( entry ->
               new UserDto(
                       entry.getUser().getId(),
                       entry.getUser().getUsername(),
                       entry.getUser().getEmail(),
                       entry.getRole()
               )
       ).toList();
    }

    private ChatDto convertToDto(Chat chat) {
        ChatDto dto = new ChatDto();
        dto.setId(chat.getId());
        dto.setName(chat.getName());
        dto.setDescription(chat.getDescription());
        dto.setPersonal(chat.getIsPersonal());
        return dto;
    }

    private ChatMessageDto convertToMessageDto(ChatMessage message) {
        ChatMessageDto dto = ChatMessageDto.fromEntity(message);
        dto.setEmail(message.getUser().getEmail());
        return dto;
    }
}