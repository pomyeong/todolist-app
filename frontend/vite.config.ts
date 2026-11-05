import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // PR-S-04: 같은 출처로 쿠키 사용, 백엔드 주소는 이 설정에만 둔다
    proxy: { '/api': 'http://localhost:3000' },
  },
  test: {
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
  },
});
