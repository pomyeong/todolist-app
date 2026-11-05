import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { changePassword, getMe, login, logout, signup, updateMe } from '../../api/auth';
import { queryKeys } from '../../api/queryKeys';
import type { User } from '../../api/types';
import { clearSession } from '../../app/session';
import { useAuthStore } from './authStore';

export function useAuthBootstrap(): void {
  const status = useAuthStore((s) => s.status);
  const { data, isError } = useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    meta: { skipAuthRedirect: true },
    enabled: status === 'unknown',
    staleTime: Infinity,
  });
  useEffect(() => {
    if (data && useAuthStore.getState().status === 'unknown') useAuthStore.getState().setUser(data);
  }, [data]);
  useEffect(() => {
    if (isError && useAuthStore.getState().status === 'unknown') useAuthStore.getState().reset();
  }, [isError]);
}

function useEnter<V>(fn: (v: V) => Promise<User>) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: fn,
    onSuccess(u) {
      useAuthStore.getState().setUser(u);
      qc.setQueryData(queryKeys.me, u);
      navigate('/todos');
    },
  });
}

export const useLogin = () => useEnter(login);
export const useSignup = () => useEnter(signup);

export function useLogout() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: logout,
    // 성공·실패 무관하게 세션을 비우고 로그인 화면으로 간다.
    onSettled() {
      clearSession(qc);
      navigate('/login', { replace: true });
    },
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMe,
    onSuccess(u) {
      useAuthStore.getState().setUser(u);
      qc.setQueryData(queryKeys.me, u);
    },
  });
}

export const useChangePassword = () => useMutation({ mutationFn: changePassword });
