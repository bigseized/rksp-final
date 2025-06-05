# Soika Chat Backend

Многоуровневый backend корпоративного чата. Состоит из нескольких сервисов:

- **auth_provider** — сервис аутентификации и авторизации (JWT)
- **chat** — сервис чатов (WebSocket, REST, хранение сообщений)
- **migrations** — миграции базы данных (Liquibase)

## Используемые технологии

- **Язык:** Java 17
- **Фреймворк:** Spring Boot 3
- **Сборка:** Gradle 8.6
- **БД:** PostgreSQL 16
- **Миграции:** Liquibase
- **Безопасность:** Spring Security, JWT
- **Веб-сокеты:** Spring WebSocket
- **Хранение файлов:** MinIO
- **Докеризация:** Docker, Docker Compose

## Структура модулей

- `auth_provider/` — сервис авторизации
- `chat/` — сервис чатов
- `migrations/` — миграции БД

## Быстрый старт через Docker Compose

1. Убедитесь, что установлен Docker и Docker Compose.
2. В корне проекта выполните:

```bash
docker-compose up --build
```

3. Сервисы будут доступны:
   - auth-provider: http://localhost:8080
   - chat: http://localhost:8081
   - MinIO: http://localhost:9000 (логин/пароль: minioadmin)
   - PostgreSQL: localhost:5432 (логин/пароль: postgres)

## Локальный запуск (без Docker)

1. Установите JDK 17+ и PostgreSQL.
2. Примените миграции (можно через Docker Compose или вручную с помощью Liquibase).
3. В каждом модуле (`auth_provider`, `chat`) настройте переменные окружения (см. ниже) и запустите:

```bash
./gradlew :auth_provider:bootRun
./gradlew :chat:bootRun
```
или для Windows:
```
gradlew.bat :auth_provider:bootRun
gradlew.bat :chat:bootRun
```

## Переменные окружения (пример для Docker Compose)

- `SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/soika`
- `SPRING_DATASOURCE_USERNAME=postgres`
- `SPRING_DATASOURCE_PASSWORD=postgres`
- `MINIO_ROOT_USER=minioadmin`
- `MINIO_ROOT_PASSWORD=minioadmin`

## Миграции

Миграции выполняются автоматически сервисом `migrations` при запуске Docker Compose. Для ручного применения используйте Liquibase с changelog-файлами из `migrations/src/main/resources/db/changelog/`.

## Докеризация

Для каждого сервиса есть свой Dockerfile. Сборка и запуск всех сервисов автоматизированы через `docker-compose.yml` в корне проекта.

---

### Полезные команды

- Сборка jar-файлов:
  ```bash
  ./gradlew :auth_provider:build
  ./gradlew :chat:build
  ```
- Запуск тестов:
  ```bash
  ./gradlew test
  ``` 