import { LanguageProvider } from '@/context/LanguageContext';

export const metadata = {
  title: 'Syzygy',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ background: 'white', fontFamily: 'monospace', padding: '20px' }}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
