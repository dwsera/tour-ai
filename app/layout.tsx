// app/layout.tsx
'use client';

import { SessionProvider } from 'next-auth/react'; // 导入 SessionProvider
import AppLayout from './AppLayout'; // 你的 AppLayout 组件
import { Inter } from 'next/font/google';
import './globals.css';
import { metadata } from './metadata'; // 导入 metadata

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <head>
        <meta name="description" content={metadata.description} />
        <meta name="title" content={metadata.title} />
        {/* 其他头部内容 */}
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <AppLayout>{children}</AppLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
