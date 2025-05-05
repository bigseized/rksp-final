FROM gradle:8.6.0-jdk17 AS build

WORKDIR /app

COPY build.gradle .
COPY settings.gradle .
COPY chat/src chat/src

RUN gradle :chat:build -x test

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/chat/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]



