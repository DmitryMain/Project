# Gadget Market — Документация проекта

## Обзор проекта

**Gadget Market** — это платформа для продажи электронных гаджетов с поддержкой двух режимов покупки:
- **Прямая продажа** — покупка товара по фиксированной цене
- **Аукцион** — торги с динамическим ценообразованием

Проект использует архитектуру **клиент-сервер** с разделением на backend (Spring Boot) и frontend (React).

---

## Структура проекта

```
gadgetMarket/
└── gadgetMarket/
    ├── backend/                    # Spring Boot backend
    │   └── src/main/java/...
    │   └── src/main/resources/
    ├── frontend/                   # React frontend
    │   └── src/
    │   └── public/
    ├── uploads/                    # Хранилище загруженных фото
    ├── pom.xml                     # Maven конфигурация backend
    ├── package.json                # npm конфигурация (корневая)
    └── README.md
```

---

## Backend (Spring Boot)

### Технологии
- **Java 17+**
- **Spring Boot 3.x**
- **Spring Security** — аутентификация и авторизация
- **Spring Data JPA** — работа с базой данных
- **Spring WebSocket** — real-time уведомления
- **Spring Mail** — отправка email-уведомлений
- **PostgreSQL** — база данных
- **Lombok** — уменьшение шаблонного кода

### Порт: `8080`

---

### Модули Backend

#### 1. `model/` — Доменные модели (сущности)

Хранит определения сущностей предметной области, которые соответствуют таблицам в базе данных.

| Файл | Описание |
|------|----------|
| `AppUser.java` | Пользователь системы: email, пароль, имя, роль, рейтинг, статус верификации |
| `UserRole.java` | Enum ролей: `BUYER` (покупатель), `SELLER` (продавец), `ADMIN` (администратор) |
| `VerificationStatus.java` | Статусы верификации: `PENDING`, `VERIFIED`, `REJECTED` |
| `Category.java` | Категории товаров: `SMARTPHONE`, `LAPTOP`, `TABLET`, `ACCESSORY`, `OTHER` |
| `Listing.java` | Объявление о продаже товара: заголовок, описание, категория, фото, продавец, статус одобрения |
| `Auction.java` | Аукцион: привязка к лоту, текущая цена, шаг ставки, лидер торгов, время окончания, статус завершения |
| `Bid.java` | Ставка на аукционе: пользователь, сумма, время создания, лимит автоставки |
| `ModerationTask.java` | Задача модерации: результаты проверки контента, качества фото, соответствия категории |

---

#### 2. `controller/` — REST контроллеры

Обработчики HTTP-запросов, формирующие API для frontend.

| Файл | Описание |
|------|----------|
| `HelloController.java` | **Регистрация и аутентификация**: `/api/users/register`, `/api/users/login`, `/api/users/me`, `/api/users/logout` |
| `CatalogController.java` | **Каталог товаров**: создание лотов с загрузкой фото (`POST /api/catalog/listings`), поиск и фильтрация (`GET /api/catalog/listings`) |
| `AuctionController.java` | **Аукционы**: создание (`POST /api/auctions`), получение списка (`GET /api/auctions`), подача ставок (`POST /api/auctions/{id}/bids`), история ставок |
| `ModerationController.java` | **Модерация** (только для ADMIN): одобрение/отклонение лотов, получение списка ожидающих лотов |
| `NotificationController.java` | **Уведомления**: отправка email, публикация событий через WebSocket |

---

#### 3. `service/` — Сервисный слой

Бизнес-логика приложения.

| Файл | Описание |
|------|----------|
| `AppUserDetailsService.java` | Загрузка пользователя для Spring Security по email |
| `AuctionService.java` | **Логика аукционов**: подача ставок, проверка правил (минимальная цена, время), обновление лидера, WebSocket-уведомления |
| `AuctionFinalizer.java` | **Планировщик**: автоматически завершает истёкшие аукционы, отправляет email-уведомления победителям и продавцам |
| `EmailService.java` | Отправка email-уведомлений о победе в аукционе и завершении торгов |

---

#### 4. `repository/` — Слой доступа к данным

Интерфейсы для работы с базой данных через Spring Data JPA.

| Файл | Описание |
|------|----------|
| `AppUserRepository.java` | CRUD для пользователей, поиск по email |
| `ListingRepository.java` | CRUD для лотов, поиск по названию, фильтрация по категории и статусу одобрения |
| `AuctionRepository.java` | CRUD для аукционов, поиск завершённых |
| `BidRepository.java` | CRUD для ставок, история ставок по аукциону |
| `ModerationTaskRepository.java` | CRUD для задач модерации, список модерируемых ID |

---

#### 5. `dto/` — Объекты передачи данных

Запросаы от клиента для создания/обновления сущностей.

| Файл | Описание |
|------|----------|
| `CreateUserRequest.java` | Данные для регистрации: email, пароль, имя, роль |
| `LoginRequest.java` | Данные для входа: email, пароль |
| `CreateListingRequest.java` | Создание лота: продавец, название, описание, категория, фото |
| `CreateAuctionRequest.java` | Создание аукциона: лот, стартовая цена, шаг, длительность |
| `BidRequest.java` | Подача ставки: покупатель, сумма, лимит автоставки |

---

#### 6. `config/` — Конфигурация

Настройка компонентов Spring.

| Файл | Описание |
|------|----------|
| `SecurityConfig.java` | **Безопасность**: настройка HTTP Security, CORS, ролевая модель, session management, password encoder (BCrypt) |
| `WebMvcConfig.java` | **Загрузка статических файлов**: обслуживание загруженных фото из `/uploads/` |
| `WebSocketConfig.java` | **WebSocket**: STOMP endpoint `/ws`, брокер сообщений `/topic` для real-time обновлений |

---

#### 7. `GadgetMarketApplication.java`

Точка входа в приложение. Включает `@EnableScheduling` для работы планировщика завершений аукционов.

---

### API Endpoints (Backend)

| Метод | Путь | Доступ | Описание |
|-------|------|--------|----------|
| POST | `/api/users/register` | pubblico | Регистрация пользователя |
| POST | `/api/users/login` | публично | Вход в систему |
| POST | `/api/users/logout` | authenticated | Выход |
| GET | `/api/users/me` | authenticated | Данные текущего пользователя |
| POST | `/api/catalog/listings` | SELLER | Создание лота |
| GET | `/api/catalog/listings` | публично | Поиск/фильтрация лотов |
| POST | `/api/auctions` | SELLER | Создание аукциона |
| GET | `/api/auctions` | публично | Список аукционов |
| POST | `/api/auctions/{id}/bids` | BUYER | Подача ставки |
| GET | `/api/auctions/{id}/bids` | публично | История ставок |
| POST | `/api/moderation/listings/{id}/approve` | ADMIN | Одобрить лот |
| POST | `/api/moderation/listings/{id}/reject` | ADMIN | Отклонить лот |
| GET | `/api/moderation/listings/pending` | ADMIN | Ожидающие модерацию лоты |
| GET | `/api/moderation/tasks` | ADMIN | Задачи модерации |

---

### WebSocket Topics (Real-time)

| Topic | Описание |
|-------|----------|
| `/topic/auctions/{id}` | Обновления конкретного аукциона (цена, лидер) |
| `/topic/events` | Системные события (завершение аукциона и др.) |

---

## Frontend (React)

### Технологии
- **React 18**
- **React Router DOM** — маршрутизация
- **@stomp/stompjs** — WebSocket клиент
- **Vite** — сборщик и dev-сервер (порт `3000`)
- **CSS Modules** — модульная стилизация

---

### Модули Frontend

#### 1. `pages/` — Страницы приложения

Основные компоненты для каждого маршрута.

| Файл | Описание |
|------|----------|
| `HomePage.jsx` | **Главная страница**: каталог лотов с поиском и фильтрами, блок активных аукционов |
| `AuctionsPage.jsx` | **Список аукционов**: все активные и завершённые аукционы |
| `AuctionDetailsPage.jsx` | **Страница аукциона**: фото товара, цена, таймер обратного отсчёта, форма ставки |
| `CreateAuctionPage.jsx` | **Создание аукциона**: выбор лота, стартовая цена, шаг, длительность |
| `CreateListingPage.jsx` | **Создание лота**: название, описание, категория, цена, фото |
| `ListingDetailsPage.jsx` | **Страница лота**: детали товара, кнопка создать аукцион |
| `ProfilePage.jsx` | **Профиль пользователя**: регистрация, вход, выход, информация о пользователе |
| `ModerationPage.jsx` | **Модерация** (ADMIN): список ожидающих лотов, одобрение/отклонение |
| `NotFoundPage.jsx` | Страница 404 |

---

#### 2. `components/` — Переиспользуемые UI компоненты

| Файл | Описание |
|------|----------|
| `Header.jsx` | Шапка сайта: логотип и навигация |
| `Navbar.jsx` | Навигационное меню |
| `Footer.jsx` | Подвал сайта |
| `AuctionCard.jsx` | Карточка аукциона (список) |
| `ListingCard.jsx` | Карточка лота (список) |
| `BidForm.jsx` | Форма подачи ставки на аукцион |
| `ui/` | **UI-библиотека**: `Button`, `Input`, `Select`, `Modal`, `Loader`, `RouterButton` |

---

#### 3. `contexts/` — React Context Providers

Глобальное состояние приложения.

| Файл | Описание |
|------|----------|
| `UserSessionContext.jsx` | **Сессия пользователя**: userId, userRole, сохранение в localStorage, проверка сессии |
| `MarketContext.jsx` | **Рыночные данные**: список аукционов, WebSocket-подключение, подписка на обновления, события |

---

#### 4. `services/` — API и WebSocket

| Файл | Описание |
|------|----------|
| `api.js` | **HTTP-клиент**: обёртка над fetch для всех API-запросов (регистрация, лоты, аукционы, модерация) |
| `websocket.js` | **WebSocket конфигурация**: URL брокера, константы тем pub/sub |

---

#### 5. `hooks/` — Кастомные React hooks

| Файл | Описание |
|------|----------|
| `useTick.js` | Hook для обновления UI каждую секунду (таймер обратного отсчёта) |

---

#### 6. `utils/` — Вспомогательные функции

| Файл | Описание |
|------|----------|
| `categoryLabels.js` | Перевод кодов категорий в читаемые названия |
| `formatRemaining.js` | Форматирование оставшегося времени до конца аукциона |

---

#### 7. `styles/` — Глобальные стили

| Файл | Описание |
|------|----------|
| `globals.css` | Глобальные стили, сброс, базовые правила |
| `tokens.css` | CSS-переменные (цвета, шрифты, отступы) |

---

#### 8. `layouts/` — Макеты страниц

| Файл | Описание |
|------|----------|
| `MainLayout.jsx` | Основной макет: Header + main content + Footer |

---

### Маршруты (Routes)

| Путь | Страница | Описание |
|------|----------|----------|
| `/` | HomePage | Главная страница |
| `/auctions` | AuctionsPage | Список аукционов |
| `/auctions/new` | CreateAuctionPage | Создание аукциона (SELLER) |
| `/auctions/:id` | AuctionDetailsPage | Детали аукциона |
| `/listings/new` | CreateListingPage | Создание лота (SELLER) |
| `/listings/:id` | ListingDetailsPage | Детали лота |
| `/profile` | ProfilePage | Профиль пользователя |
| `/moderation` | ModerationPage | Модерация (ADMIN) |

---

## Ролевая модель

| Роль | Возможности |
|------|-------------|
| **BUYER** | Просмотр лотов, участие в аукционах, подача ставок |
| **SELLER** | Всё от BUYER + создание лотов, создание аукционов |
| **ADMIN** | Всё от SELLER + модерация лотов (одобрение/отклонение) |

---

## Бизнес-логика

### Процесс создания и продажи товара

1. **Создание лота** (SELLER):
   - Заполнение формы (название, описание, категория, цена, фото)
   - Лот сохраняется с `approved = false`

2. **Модерация** (ADMIN):
   - Админ проверяет лот в `/moderation`
   - Одобрение → `approved = true`, лот появляется в каталоге

3. **Создание аукциона** (SELLER):
   - Выбрать одобренный лот
   - Указать стартовую цену, шаг, длительность
   - Аукцион запускается

4. **Торги** (BUYER):
   - Покупатели видят аукцион, текущую цену и таймер
   - Подача ставки: сумма ≥ текущая цена + шаг
   - Real-time обновление через WebSocket
   - Можно указать лимит автоставки

5. **Завершение аукциона**:
   - Планировщик (`AuctionFinalizer`) проверяет истёкшие аукционы каждую минуту
   - Пометка `finished = true`
   - Email-уведомления победителю и продавцу

---

## Конфигурация (application.properties)

```properties
# Сервер
server.port=8080

# База данных
spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=update

# Планировщик аукционов
app.auctions.finalizer.delay-ms=60000

# Email (MailHog для локальной разработки)
spring.mail.host=localhost
spring.mail.port=1025

# Загрузка файлов
spring.servlet.multipart.max-file-size=10MB
app.upload.dir=uploads
```

---

## Запуск проекта

### Backend
```bash
cd gadgetMarket/backend
mvn spring-boot:run
```

### Frontend
```bash
cd gadgetMarket/frontend
npm install
npm run dev
```

### Требования
- Java 17+
- Node.js 18+
- PostgreSQL 14+
- (Опционально) MailHog для локальной отправки email

---

## Структура данных (кратко)

### AppUser
- id, email, passwordHash, displayName, role, verificationStatus, sellerRating

### Listing
- id, title, description, category, photoPath, approved, seller

### Auction
- id, listing, currentPrice, minStep, leader, endAt, finished

### Bid
- id, auction, bidder, amount, createdAt, autoBidLimit

### ModerationTask
- id, listing, forbiddenContent, imageQualityOk, categoryMatch, blocked

---

## Примечания

- Фото товаров хранятся в директории `/uploads/`
- CORS настроен для `http://localhost:3000`
- Сессии хранятся в HTTP session (JSESSIONID cookie)
- Пароли хешируются через BCrypt
- WebSocket используется для real-time обновлений цен на аукционах
