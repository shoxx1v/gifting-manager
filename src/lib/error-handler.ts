/**
 * エラーハンドリングユーティリティ
 *
 * アプリケーション全体で一貫したエラーハンドリングを提供
 */

// エラーの種類
export type ErrorType =
  | 'network'      // ネットワークエラー
  | 'auth'         // 認証エラー
  | 'validation'   // バリデーションエラー
  | 'database'     // データベースエラー
  | 'permission'   // 権限エラー
  | 'notfound'     // リソースが見つからない
  | 'unknown';     // 不明なエラー

// アプリケーションエラークラス
export class AppError extends Error {
  type: ErrorType;
  originalError?: unknown;

  constructor(message: string, type: ErrorType = 'unknown', originalError?: unknown) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.originalError = originalError;
  }
}

// Supabaseエラーをパース
export function parseSupabaseError(error: unknown): AppError {
  if (!error) {
    return new AppError('不明なエラーが発生しました', 'unknown');
  }

  // PostgreSQL/Supabaseエラーコードをチェック
  const supabaseError = error as { code?: string; message?: string; details?: string };

  if (supabaseError.code) {
    switch (supabaseError.code) {
      case '23505': // unique_violation
        return new AppError('同じデータが既に存在します', 'validation', error);
      case '23503': // foreign_key_violation
        return new AppError('関連するデータが見つかりません', 'database', error);
      case '42501': // insufficient_privilege
        return new AppError('この操作を行う権限がありません', 'permission', error);
      case 'PGRST301': // Row not found
        return new AppError('データが見つかりませんでした', 'notfound', error);
      case 'PGRST116': // Multiple rows
        return new AppError('複数のデータが見つかりました', 'database', error);
      default:
        break;
    }
  }

  // HTTPステータスコードをチェック
  const httpError = error as { status?: number };
  if (httpError.status) {
    switch (httpError.status) {
      case 401:
        return new AppError('認証が必要です。再度ログインしてください', 'auth', error);
      case 403:
        return new AppError('この操作を行う権限がありません', 'permission', error);
      case 404:
        return new AppError('リソースが見つかりませんでした', 'notfound', error);
      case 500:
        return new AppError('サーバーエラーが発生しました', 'database', error);
      default:
        break;
    }
  }

  // ネットワークエラーをチェック
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AppError('ネットワークに接続できません', 'network', error);
  }

  // 一般的なエラーメッセージ
  const message = supabaseError.message || 'エラーが発生しました';
  return new AppError(message, 'unknown', error);
}

// エラーを日本語メッセージに変換
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  const appError = parseSupabaseError(error);
  return appError.message;
}

// エラータイプに応じたトースト種別を取得
export function getToastTypeForError(error: unknown): 'error' | 'warning' {
  if (error instanceof AppError) {
    switch (error.type) {
      case 'validation':
      case 'notfound':
        return 'warning';
      default:
        return 'error';
    }
  }
  return 'error';
}

// 非同期処理のラッパー（エラーハンドリング付き）
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options?: {
    onError?: (error: AppError) => void;
    rethrow?: boolean;
  }
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const appError = error instanceof AppError ? error : parseSupabaseError(error);

    if (options?.onError) {
      options.onError(appError);
    }

    if (options?.rethrow) {
      throw appError;
    }

    return null;
  }
}

// AbortController付きのfetch
export function createAbortableFetch(timeoutMs: number = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    abort: () => {
      clearTimeout(timeoutId);
      controller.abort();
    },
    cleanup: () => {
      clearTimeout(timeoutId);
    },
  };
}

// リトライロジック
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, onRetry } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        onRetry?.(attempt, error);
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
}
