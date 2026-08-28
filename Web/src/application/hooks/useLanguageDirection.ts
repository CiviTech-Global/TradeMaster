import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getLanguageDirection } from '../../infrastructure/i18n/i18n';

export const useLanguageDirection = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      const dir = getLanguageDirection(lng);
      document.documentElement.dir = dir;
      document.documentElement.lang = lng;
    };

    handleLanguageChanged(i18n.language);

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);
};

export default useLanguageDirection;
