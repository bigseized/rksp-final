FROM gradle:8.6.0-jdk17 AS build

WORKDIR /app

COPY backend/build.gradle .
COPY backend/settings.gradle .
COPY backend/chat/src chat/src

RUN gradle :chat:build -x test

# Стадия запуска
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/chat/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]