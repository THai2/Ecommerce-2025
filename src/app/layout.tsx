import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

const outfit = Outfit({
  subsets: ["latin"],
});

import { APP_DESCRIPTION, APP_NAME, APP_SLOGAN } from '@/lib/constants'
import { Metadata } from 'next';
import ClientProviders from '@/components/shared/client-providers';
export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: `${APP_NAME}. ${APP_SLOGAN}`,
  },
  description: APP_DESCRIPTION,
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider><ClientProviders>{children}</ClientProviders></SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
