FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY maven-settings.xml /root/.m2/settings.xml
COPY pom.xml .
COPY src ./src
RUN mvn -s /root/.m2/settings.xml -q -DskipTests package

FROM eclipse-temurin:21-jre
LABEL org.opencontainers.image.title="Potato Clock Backend" \
      org.opencontainers.image.authors="CintaOvO <D1391571546@outlook.com>" \
      org.opencontainers.image.source="https://github.com/Cinnamo-roll/Cinta-PotatoClock" \
      org.opencontainers.image.url="https://clock.cinoo.xyz" \
      org.opencontainers.image.licenses="PolyForm-Noncommercial-1.0.0"
WORKDIR /app
COPY --from=build /app/target/clock-backend-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
