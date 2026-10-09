import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { getLabData } from '@/lib/getLabData';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'EdgeSys Research Lab',
  description: 'EdgeSys Research Lab — research in edge, fog, distributed and intelligent computing.'
};

import { EdgeMeshCanvas } from '@/components/EdgeMeshCanvas';

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const initialData = await getLabData();

  return (
    <html
      lang="en"
      data-theme={initialData.settings.themeMode || 'dark'}
      data-theme-preset={initialData.settings.themePreset || 'cyber-blue'}
    >
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <ToastProvider>
          <AuthProvider>
            <DataProvider initialData={initialData}>
              <EdgeMeshCanvas />
              <SiteHeader />
              <main id="main-content" tabIndex={-1}>
                {children}
              </main>
              <SiteFooter />
            </DataProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
