'use client';

import { useRouter } from 'next/navigation';
import { useBrand, BRANDS, Brand } from '@/contexts/BrandContext';
import { Building2 } from 'lucide-react';

// ブランド情報
const BRAND_INFO: Record<Brand, {
  name: string;
  fullName: string;
  description: string;
}> = {
  TL: {
    name: 'TL',
    fullName: "That's life",
    description: 'カジュアル＆ストリート',
  },
  BE: {
    name: 'BE',
    fullName: 'Belvet',
    description: 'エレガント＆フェミニン',
  },
  AM: {
    name: 'AM',
    fullName: 'Antimid',
    description: 'モード＆アバンギャルド',
  },
};

export default function BrandSelectPage() {
  const router = useRouter();
  const { setCurrentBrand } = useBrand();

  const handleSelectBrand = (brand: Brand) => {
    setCurrentBrand(brand);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      {/* ヘッダー */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Building2 size={40} className="text-gray-800" />
          <h1 className="text-3xl font-bold text-gray-900">Gifting Manager</h1>
        </div>
        <p className="text-gray-500 text-lg">ブランドを選択してください</p>
      </div>

      {/* ブランド選択カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {BRANDS.map((brand) => {
          const info = BRAND_INFO[brand];
          return (
            <button
              key={brand}
              onClick={() => handleSelectBrand(brand)}
              className="group bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 hover:border-gray-800 hover:shadow-xl transition-all duration-300 text-left"
            >
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-gray-100 rounded-lg text-2xl font-bold text-gray-800 group-hover:bg-gray-800 group-hover:text-white transition-colors">
                  {info.name}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {info.fullName}
              </h2>
              <p className="text-gray-500 text-sm">
                {info.description}
              </p>
              <div className="mt-6 flex items-center text-gray-400 group-hover:text-gray-800 transition-colors">
                <span className="text-sm font-medium">選択して開始</span>
                <svg
                  className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {/* フッター */}
      <p className="mt-12 text-sm text-gray-400">
        ブランドは後からサイドバーで切り替えることもできます
      </p>
    </div>
  );
}
