// API response and error types — mirrors server/types/index.ts

export interface ApiMeta {
  timestamp: string;
  [key: string]: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ErrorCode =
  | 'DATA_ROOT_NOT_SET'
  | 'DATA_ROOT_INVALID'
  | 'FILE_NOT_FOUND'
  | 'INVALID_FRONTMATTER'
  | 'PATH_TRAVERSAL'
  | 'MIGRATION_IN_PROGRESS'
  | 'SQLITE_NOT_FOUND'
  | 'INTERNAL_ERROR';

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
