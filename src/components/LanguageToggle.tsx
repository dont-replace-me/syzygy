'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
      style={{ padding: '4px 12px', cursor: 'pointer' }}
    >
      {t.language}
    </button>
  );
}
