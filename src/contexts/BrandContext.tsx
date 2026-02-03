'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 固定の3ブランド
export const BRANDS = ['TL', 'BE', 'AM'] as const;
export type Brand = typeof BRANDS[number];

interface BrandContextType {
  currentBrand: Brand;
  setCurrentBrand: (brand: Brand) => void;
  brands: readonly Brand[];
  isBrandSelected: boolean;
  clearBrandSelection: () => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [currentBrand, setCurrentBrand] = useState<Brand>('TL');
  const [isBrandSelected, setIsBrandSelected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // ローカルストレージから復元
  useEffect(() => {
    const saved = localStorage.getItem('selectedBrand');
    const hasSelected = localStorage.getItem('brandSelected') === 'true';

    if (saved && BRANDS.includes(saved as Brand)) {
      setCurrentBrand(saved as Brand);
    }
    setIsBrandSelected(hasSelected);
    setIsInitialized(true);
  }, []);

  // ローカルストレージに保存
  const handleSetBrand = (brand: Brand) => {
    setCurrentBrand(brand);
    setIsBrandSelected(true);
    localStorage.setItem('selectedBrand', brand);
    localStorage.setItem('brandSelected', 'true');
  };

  // ブランド選択をクリア（ログアウト時などに使用）
  const clearBrandSelection = () => {
    setIsBrandSelected(false);
    localStorage.removeItem('brandSelected');
  };

  // 初期化完了まで待機
  if (!isInitialized) {
    return null;
  }

  return (
    <BrandContext.Provider value={{
      currentBrand,
      setCurrentBrand: handleSetBrand,
      brands: BRANDS,
      isBrandSelected,
      clearBrandSelection,
    }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}
