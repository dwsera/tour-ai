// app/RootLayout.tsx 或 app/AppLayout.tsx
'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import Header from '@/components/Header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
 <div className="h-screen overflow-hidden bg-background flex flex-col">
      <Header onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />

        <main
          className={`flex-1 transition-all duration-300 ease-in-out overflow-y-auto ${
            isSidebarOpen ? 'ml-60' : 'ml-0'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
