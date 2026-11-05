import { request } from './client';
import type { User } from './types';

export const signup = (b: { email: string; password: string; name: string }) =>
  request<User>('POST', '/api/auth/signup', b);
export const login = (b: { email: string; password: string }) =>
  request<User>('POST', '/api/auth/login', b);
export const logout = () => request<void>('POST', '/api/auth/logout');
export const getMe = () => request<User>('GET', '/api/me');
export const updateMe = (b: { name: string }) => request<User>('PATCH', '/api/me', b);
export const changePassword = (b: { currentPassword: string; newPassword: string }) =>
  request<void>('PUT', '/api/me/password', b);
