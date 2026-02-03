'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import AIChatWidget from '@/components/ui/AIChatWidget';
import { useBrand, Brand } from '@/contexts/BrandContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

// ブランドごとの設定（グレー系で統一）
const BRAND_CONFIG: Record<Brand, {
  name: string;
  bgColor: string;
  textColor: string;
  description: string;
}> = {
  TL: {
    name: 'TL',
    bgColor: 'bg-gray-800',
    textColor: 'text-gray-800',
    description: "That's life",
  },
  BE: {
    name: 'BE',
    bgColor: 'bg-gray-800',
    textColor: 'text-gray-800',
    description: 'Belvet',
  },
  AM: {
    name: 'AM',
    bgColor: 'bg-gray-800',
    textColor: 'text-gray-800',
    description: 'Antimid',
  },
};

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentBrand, isBrandSelected } = useBrand();
  const brandConfig = BRAND_CONFIG[currentBrand];

  // ブランドが選択されていない場合、ブランド選択画面にリダイレクト
  useEffect(() => {
    if (!isBrandSelected && pathname !== '/brand-select' && pathname !== '/auth') {
      router.push('/brand-select');
    }
  }, [isBrandSelected, pathname, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
        {/* シンプルなブランド表示バー */}
        <div className={`sticky top-0 z-30 ${brandConfig.bgColor}`}>
          <div className="px-4 lg:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-white font-bold text-lg">{brandConfig.name}</span>
              <span className="text-white/70 text-sm">
                {brandConfig.description}
              </span>
            </div>
            <div className="text-white/50 text-xs">
              {brandConfig.name} のデータを表示中
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6">{children}</div>
      </main>

      <BottomNav />
      <AIChatWidget />
    </div>
  );
}
