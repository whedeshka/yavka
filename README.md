# Явка — локальная версия для GitHub

Облачная перекличка и Firebase удалены. Староста отмечает студентов самостоятельно во вкладке «Отметить пару». Данные хранятся локально на устройстве/в браузере; автоматической синхронизации между устройствами нет.

## Опубликовать сайт через GitHub Pages
1. Создайте на GitHub новый пустой репозиторий.
2. Загрузите содержимое этой папки `yavka-apk` в корень репозитория (папки `www`, `desktop`, `.github` и файлы рядом).
3. Откройте Settings → Pages и выберите GitHub Actions как источник публикации.
4. Вкладка Actions запустит workflow «GitHub Pages». После успешного запуска адрес будет вида `https://ВАШ-ЛОГИН.github.io/ИМЯ-РЕПОЗИТОРИЯ/`.

## Создать приложение Windows на GitHub
После загрузки репозитория откройте Actions → «Сборка Windows» → Run workflow. Готовый `.exe` будет в Artifacts у завершённого запуска.

## Создать APK Android на GitHub
Откройте Actions → «Сборка APK» → Run workflow. Готовый APK будет в Artifacts.

## Запуск на компьютере локально
В папке `desktop`: `npm install`, затем `npm run dist` (если скрипт dist отсутствует — `npx electron-builder --win portable`).

## Важно
- Firebase Hosting, Firestore, Authentication и облачная студенческая ссылка больше не используются. Старый сайт в Firebase сам по себе не удаляется — при необходимости отключите/удалите его отдельно в Firebase Console.
- Не удаляйте папку `desktop`: она нужна для Windows-приложения.
- Храните резервные копии данных приложения: локальные данные не попадут в GitHub автоматически.

## Отметка одногруппников через Firebase (ссылка для студентов)
1. console.firebase.google.com → создать проект → Build → **Authentication** → Sign-in method → включить **Anonymous**.
2. Build → **Firestore Database** → создать базу → вкладка Rules → вставить содержимое `firestore.rules` → Publish.
3. Project settings → Your apps → Web (`</>`) → скопировать `firebaseConfig` в `www/firebase-config.js` (и в `desktop/app/firebase-config.js`).
4. Залить в GitHub, дождаться публикации Pages.
5. В приложении: вкладка «Группа» → «Создать ссылку» → отправить одногруппникам.
6. «Отметить пару» → выбрать пару → «Ответы студентов»: те, кто не придёт, отметятся как отсутствующие.
