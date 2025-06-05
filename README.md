# Soika Chat

Корпоративный чат с поддержкой личных и групповых сообщений.

- [Frontend (React, TypeScript)](./frontend/README.md)
- [Backend (Spring Boot, Kotlin)](./backend/README.md)

## Быстрый старт (Docker Compose)

1. Установите Docker и Docker Compose.
2. В корне проекта выполните:

```bash
docker-compose up --build
```

3. Откройте:
   - Frontend: http://localhost:3000
   - Auth Provider API: http://localhost:8080
   - Chat API: http://localhost:8081
   - MinIO: http://localhost:9000 (minioadmin/minioadmin)
   - PostgreSQL: localhost:5432 (postgres/postgres)

## О проекте

- Реализация корпоративного чата с аутентификацией, личными и групповыми чатами, real-time сообщениями и хранением файлов.
- Подробнее о запуске и настройке — см. README соответствующего модуля. 