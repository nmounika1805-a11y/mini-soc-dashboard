FROM maven:3.9.11-eclipse-temurin-21

WORKDIR /app

COPY . .

WORKDIR /app/backend

RUN mvn clean package -DskipTests

EXPOSE 8080

CMD ["java", "-jar", "target/mini-soc-backend-0.0.1-SNAPSHOT.jar"]