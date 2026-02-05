/**
 * フォームバリデーションユーティリティ
 */

import { CampaignFormData } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// 案件フォームのバリデーション
export function validateCampaignForm(
  formData: CampaignFormData,
  options: {
    isInternationalShipping?: boolean;
    postDateMode?: 'single' | 'range';
  } = {}
): ValidationResult {
  const errors: ValidationError[] = [];

  // 必須項目チェック
  if (!formData.influencer_id) {
    errors.push({ field: 'influencer_id', message: 'インフルエンサーを選択してください' });
  }

  if (!formData.item_code?.trim()) {
    errors.push({ field: 'item_code', message: '品番を入力してください' });
  }

  if (!formData.sale_date) {
    errors.push({ field: 'sale_date', message: 'セール日を入力してください' });
  }

  // 枚数の範囲チェック
  if (formData.item_quantity < 1) {
    errors.push({ field: 'item_quantity', message: '枚数は1以上で入力してください' });
  }
  if (formData.item_quantity > 100) {
    errors.push({ field: 'item_quantity', message: '枚数は100枚以下で入力してください' });
  }

  // 金額の整合性チェック
  if (formData.offered_amount < 0) {
    errors.push({ field: 'offered_amount', message: '提示額は0以上で入力してください' });
  }
  if (formData.agreed_amount < 0) {
    errors.push({ field: 'agreed_amount', message: '合意額は0以上で入力してください' });
  }

  // 海外発送設定のバリデーション
  if (options.isInternationalShipping || formData.is_international_shipping) {
    if (!formData.shipping_country?.trim()) {
      errors.push({ field: 'shipping_country', message: '海外発送の場合は発送先国を選択してください' });
    }
    if (formData.international_shipping_cost <= 0) {
      errors.push({ field: 'international_shipping_cost', message: '海外送料を入力してください' });
    }
  }

  // 日付範囲のバリデーション
  if (options.postDateMode === 'range') {
    if (formData.desired_post_start && formData.desired_post_end) {
      const start = new Date(formData.desired_post_start);
      const end = new Date(formData.desired_post_end);
      if (start > end) {
        errors.push({ field: 'desired_post_end', message: '終了日は開始日以降の日付を選択してください' });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// 特定フィールドのエラーを取得
export function getFieldError(errors: ValidationError[], field: string): string | undefined {
  return errors.find(e => e.field === field)?.message;
}

// エラーメッセージをまとめて取得
export function getErrorMessages(errors: ValidationError[]): string[] {
  return errors.map(e => e.message);
}
