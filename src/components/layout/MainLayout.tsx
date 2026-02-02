'use client';

import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* 背景デコレーション */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl" />
      </div>

      <Sidebar />
      <main className="lg:ml-72 min-h-screen relative">
        <div className="p-4 lg:p-8 animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
