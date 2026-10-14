
# Build Spring Boot backend
FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /app
COPY backend/demo/pom.xml .
COPY backend/demo/src ./src
RUN mvn clean package -DskipTests

# Build React frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Final runtime image
FROM eclipse-temurin:21-jre
WORKDIR /app

RUN apt-get update \
    && apt-get install -y nginx \
    && rm -rf /var/lib/apt/lists/*

COPY --from=backend-build /app/target/*.jar /app/app.jar
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY start.sh /app/start.sh

RUN chmod +x /app/start.sh

EXPOSE 8080
CMD ["/app/start.sh"]
