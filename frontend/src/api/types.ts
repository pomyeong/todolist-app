export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// PD-19
export type Status = 'completed' | 'not_started' | 'in_progress' | 'overdue';
export const STATUSES: readonly Status[] = ['completed', 'not_started', 'in_progress', 'overdue'];
export const STATUS_LABEL: Record<Status, string> = {
  completed: '완료',
  not_started: '시작 전',
  in_progress: '진행 중',
  overdue: '지연',
};

export interface Todo {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  startTime: string | null; // 'HH:MM'(BR-24)
  endTime: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// 목록·캘린더
export interface TodoWithStatus extends Todo {
  status: Status;
}

export interface TodoFilter {
  categoryId?: number;
  status?: Status;
}

export interface TodoInput {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  categoryId?: number;
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'DEFAULT_CATEGORY_IMMUTABLE'
  | 'INVALID_PASSWORD'
  | 'UNAUTHORIZED'
  | 'INVALID_CREDENTIALS'
  | 'NOT_FOUND'
  | 'DUPLICATE_EMAIL'
  | 'DUPLICATE_CATEGORY'
  | 'INTERNAL_ERROR';

export class ApiError extends Error {
  status: number;
  code: ErrorCode;
  fields?: Record<string, string>;

  constructor(status: number, code: ErrorCode, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}
