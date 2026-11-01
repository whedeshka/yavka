# Явка 9.0 — APK, Windows и онлайн-перекличка

## Что внутри
- `www/index.html` — приложение старосты (Android и браузер).
- `desktop/` — приложение Windows EXE; запускает локальный HTTP-сервер для корректной работы Firebase Auth в Electron.
- `hosting/index.html` и `hosting/student.html` — публичная студенческая страница.
- `firebase.json`, `.firebaserc`, `firestore.rules` — настройки Firebase Hosting и Firestore.

## ВАЖНО: сначала настройте Firebase Console
1. Authentication → Sign-in method → включите **Anonymous** (студентам) и Email/Password (старосте).
2. В Authentication → Users убедитесь, что аккаунт старосты создан и email подтверждён. Правила Firestore ниже ограничивают админ-доступ адресом `d3mon228@gmail.com`; если аккаунт старосты другой, замените email в `firestore.rules` перед публикацией.
3. В Firestore → Rules замените правила содержимым `firestore.rules` (или разверните через CLI). Не используйте открытые правила.

## Публикация с Windows
Распакуйте архив, откройте PowerShell в папке `yavka-apk` (там, где лежит `firebase.json`) и выполните:

```powershell
firebase.cmd deploy --only hosting,firestore:rules
```

После публикации студенческая ссылка: `https://wdyavka.web.app/?group=26л-02`.

## Работа старосты
- В приложении откройте вкладку «Группа» и внесите реальные фамилии (одна фамилия на строку). Не оставляйте тестовые «Студент 1/2/3».
- Откройте вкладку «Онлайн», войдите под email/password аккаунтом старосты.
- Нажмите «Открыть перекличку на сегодня», скопируйте ссылку и отправьте группе.
- Ответы появляются в реальном времени. «Перенести отсутствующих в журнал» добавляет отсутствия в локальный журнал на текущем устройстве.
- Для просмотра на другом устройстве войдите в тот же аккаунт старосты; локальный журнал посещаемости сам по себе между устройствами не синхронизируется.

## Ограничения идентификации
Студенты входят анонимно. Firestore разрешает одну отправку на один анонимный браузер/устройство, но это **не подтверждает личность студента**: человек может очистить данные браузера или выбрать чужую фамилию. Староста должен сверять ответы. Для строгой защиты понадобятся персональные PIN-коды/учётные записи студентов или серверная функция. Неприславшие ответ не считаются автоматически отсутствующими.

## Сборка APK
Содержимое папки `www` используется как `webDir` Capacitor. Workflow `.github/workflows/build-apk.yml` собирает APK.

## Сборка Windows
Workflow `.github/workflows/build-windows.yml` копирует `www` в desktop app, локальную библиотеку Excel и Firebase-модули, затем собирает portable EXE.

## Данные
Локальные записи посещаемости сохраняются локально. Онлайн-ответы хранятся в Firestore. Домашние задания и Supabase в этой версии отсутствуют.


## Version 9.2.0

Fixed opening a daily attendance session: the publish handler now calls the cloud watch function through `window.yavkaCloud.watch(...)` instead of using an undefined lexical `this`. This fixes the runtime error `Cannot read properties of undefined (reading 'watch')`.
