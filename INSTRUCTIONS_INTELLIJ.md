# Инструкция по запуску через IntelliJ IDEA

## 1. Открыть проект

Откройте IntelliJ IDEA и выберите:
**File → Open** → выберите папку:  
`C:\Users\User\OneDrive\Рабочий стол\gadgetMarket\gadgetMarket\gadgetMarket`  
(ту папку, в которой лежит файл `pom.xml`)

IntelliJ автоматически распознает Maven проект и загрузит зависимости.

## 2. Создать Run Configuration

Первый запуск (один раз):
1. В дереве проекта найдите файл:  
   `backend/src/main/java/org/example/gadgetmarket/GadgetMarketApplication.java`
2. Нажмите **правой кнопкой мыши** на файл → **Run 'GadgetMarketApplication'**
3. Или нажмите на зелёный треугольник ▶ слева от строки `public class GadgetMarketApplication`

После этого IntelliJ создаст конфигурацию запуска. В следующий раз достаточно нажать ▶ в правом верхнем углу.

## 3. Если порт 8080 занят (ошибка)

### ВАЖНО: перед каждым запуском НЕ закрывайте предыдущий запуск!  
Если вы запустили приложение и оно работает, новый экземпляр запустить не получится (порт занят).

### Если ошибка "Port 8080 was already in use":
1. В IntelliJ откройте **Terminal** (Alt+F12)
2. Выполните команды:
```bash
netstat -ano | findstr :8080
```
3. Найдите строку с `LISTENING` и PID (последнее число)
4. Остановите процесс:
```bash
taskkill /PID <номер> /F
```
5. Запустите приложение снова

## 4. Либо сменить порт (рекомендуется для разработки)

Откройте файл:
`backend/src/main/resources/application.properties`

Измените:
```properties
server.port=8081
```

Тогда приложение будет доступно по адресу `http://localhost:8081`.

❗ **После смены порта не забудьте также настроить frontend**, так как он обращается на 8080 порт. Если frontend не настраивали — лучше оставить порт 8080.