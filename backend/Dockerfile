FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY maven-settings.xml /root/.m2/settings.xml
COPY pom.xml .
COPY src ./src
RUN mvn -s /root/.m2/settings.xml -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/clock-backend-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
