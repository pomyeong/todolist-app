import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // 백엔드 CORS_ORIGIN 기본값과 같아야 한다(PR-S-04)
  },
  test: {
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
  },
});
