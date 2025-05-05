FROM gradle:8.6.0-jdk17 AS build

WORKDIR /app

COPY build.gradle .
COPY settings.gradle .
COPY auth_provider/src auth_provider/src

RUN gradle :auth_provider:build -x test

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/auth_provider/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]


