// PR-S-13: 개발 모드에서만 콘솔에 남긴다. 운영 빌드에서는 DEV가 false라 출력이 없고, vitest 출력도 더럽히지 않는다.
// 본문·쿠키·비밀번호는 넘기지 않는다.
const enabled = import.meta.env.DEV && import.meta.env.MODE !== 'test';

export function log(area: string, ...args: unknown[]): void {
  if (enabled) console.log(`[${area}]`, ...args);
}

export function logError(area: string, ...args: unknown[]): void {
  if (enabled) console.warn(`[${area}]`, ...args);
}
