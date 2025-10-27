// lib/env.dart
class Env {
  // Важное: значения придут из Netlify (через --dart-define), в коде их нет.
  static const supabaseUrl  = String.fromEnvironment('SUPABASE_URL');
  static const supabaseAnon = String.fromEnvironment('SUPABASE_ANON_KEY');

  // Опционально (если будешь подключать Firebase)
  static const firebaseApiKey    = String.fromEnvironment('FIREBASE_API_KEY');
  static const firebaseProjectId = String.fromEnvironment('FIREBASE_PROJECT_ID');

  // Просто красиво для заголовка/титула сайта
  static const appName = String.fromEnvironment('APP_NAME', defaultValue: 'Sport Diary');
}
