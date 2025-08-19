# Foxy Sync Pack

1) Залей содержимое этой папки на Vercel (New Project -> Deploy). Build Command: пусто, Output Directory: /
2) Firebase Console -> Authentication -> Settings -> Authorized domains: добавь свой *.vercel.app домен.
3) Firestore -> Rules: вставь rules из firestore.rules и Publish.
4) Открой сайт, пройди опрос до конца. Затем в консоли выполни __forceSync() (опционально).
5) Данные появятся в Firestore: users/{uid}/questionnaire и users/{uid}/symptoms/{YYYY-MM-DD}.
