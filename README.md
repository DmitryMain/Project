# Gadget Market MVP

MVP implementation based on marketplace + auctions specification.

## Stack
- Frontend: React + Vite
- Backend: Spring Boot (REST API + WebSocket + JPA)
- Database: PostgreSQL

## Backend run
1. Create PostgreSQL database: `gadget_market`
2. Configure credentials in `backend/src/main/resources/application.properties`
3. Start server:
   - `./mvnw spring-boot:run` (Linux/Mac)
   - `mvnw.cmd spring-boot:run` (Windows)

## Frontend run
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Implemented modules
- Users: registration, email verification, profile basis
- Catalog: listing creation, category filter, text search
- Auctions: create auction, min step validation, bid history, timer
- Moderation: photo/content/category checks, content blocking
- Notifications: WebSocket channels and email queue stub