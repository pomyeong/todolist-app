import { useRouteError } from 'react-router';
import { useT } from '../i18n';
import { logError } from '../lib/log';
import styles from './RouteError.module.css';

// 라우터 errorElement: 렌더링 오류·배포 후 옛 청크 로드 실패 시 기본 개발용 화면 대신 보인다. 새로고침이 최신 파일을 받아 복구한다.
export function RouteError() {
  const t = useT();
  logError('router', useRouteError());
  return (
    <main role="alert" className={styles.box}>
      <h1 className={styles.title}>{t('error.title')}</h1>
      <p>{t('error.body')}</p>
      <button type="button" className="primary" onClick={() => window.location.reload()}>
        {t('error.reload')}
      </button>
    </main>
  );
}
