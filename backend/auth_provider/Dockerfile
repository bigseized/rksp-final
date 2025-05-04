FROM gradle:8.6.0-jdk17 AS build

WORKDIR /app

COPY backend/build.gradle .
COPY backend/settings.gradle .
COPY backend/auth_provider/src auth_provider/src

RUN gradle :auth_provider:build -x test

# Стадия запуска
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/auth_provider/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]