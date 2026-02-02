'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 固定の3ブランド
export const BRANDS = ['TL', 'BE', 'AM'] as const;
export type Brand = typeof BRANDS[number];

interface BrandContextType {
  currentBrand: Brand;
  setCurrentBrand: (brand: Brand) => void;
  brands: readonly Brand[];
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [currentBrand, setCurrentBrand] = useState<Brand>('TL');

  // ローカルストレージから復元
  useEffect(() => {
    const saved = localStorage.getItem('selectedBrand');
    if (saved && BRANDS.includes(saved as Brand)) {
      setCurrentBrand(saved as Brand);
    }
  }, []);

  // ローカルストレージに保存
  const handleSetBrand = (brand: Brand) => {
    setCurrentBrand(brand);
    localStorage.setItem('selectedBrand', brand);
  };

  return (
    <BrandContext.Provider value={{ currentBrand, setCurrentBrand: handleSetBrand, brands: BRANDS }}>
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
