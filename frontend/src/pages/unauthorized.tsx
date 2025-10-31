import { useTranslation } from 'react-i18next';
import Link from 'next/link';

const UnauthorizedPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <h1 className="text-4xl font-bold text-red-600 mb-4">{t('access_denied')}</h1>
      <p className="text-lg text-text mb-8">{t('no_permission')}</p>
      <Link href="/">
        <a className="bg-primary text-white font-bold py-2 px-4 rounded-lg">
          {t('go_home')}
        </a>
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
