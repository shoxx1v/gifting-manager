/**
 * インフルエンサースコア計算ユーティリティ
 *
 * スコア計算ロジックを一元化し、重複を排除
 */

// スコア計算の基準値
export const SCORE_THRESHOLDS = {
  /** 検討コメントの基準値（この値で100点） */
  CONSIDERATION_COMMENTS_BASE: 50,
  /** 平均いいね数の基準値（この値で100点） */
  AVG_LIKES_BASE: 1000,
  /** コスト効率計算の閾値 */
  COST_PER_LIKE_THRESHOLD: 200,
  /** コスト効率計算のレンジ */
  COST_PER_LIKE_RANGE: 150,
  /** デフォルトの納期遵守率 */
  DEFAULT_RELIABILITY: 80,
} as const;

// スコアウェイト（重み付け）
export const SCORE_WEIGHTS = {
  consideration: 0.40,
  engagement: 0.25,
  efficiency: 0.20,
  reliability: 0.15,
} as const;

// ランク判定閾値
export const RANK_THRESHOLDS = {
  S: 75,
  A: 55,
  B: 35,
} as const;

export type InfluencerRank = 'S' | 'A' | 'B' | 'C';

export interface ScoreInput {
  avgConsiderationComments: number;
  avgLikes: number;
  costPerLike: number;
  onTimeRate?: number; // 納期遵守率（0-100）
}

export interface ScoreResult {
  considerationScore: number;
  engagementScore: number;
  efficiencyScore: number;
  reliabilityScore: number;
  totalScore: number;
  rank: InfluencerRank;
}

/**
 * 検討コメントスコアを計算
 */
export function calculateConsiderationScore(avgConsiderationComments: number): number {
  return Math.min(100, (avgConsiderationComments / SCORE_THRESHOLDS.CONSIDERATION_COMMENTS_BASE) * 100);
}

/**
 * エンゲージメントスコアを計算
 */
export function calculateEngagementScore(avgLikes: number): number {
  return Math.min(100, (avgLikes / SCORE_THRESHOLDS.AVG_LIKES_BASE) * 100);
}

/**
 * コスト効率スコアを計算
 */
export function calculateEfficiencyScore(costPerLike: number): number {
  if (costPerLike <= 0) return 50; // デフォルト値

  const { COST_PER_LIKE_THRESHOLD, COST_PER_LIKE_RANGE } = SCORE_THRESHOLDS;
  return Math.max(0, Math.min(100, ((COST_PER_LIKE_THRESHOLD - costPerLike) / COST_PER_LIKE_RANGE) * 100));
}

/**
 * インフルエンサーの総合スコアを計算
 */
export function calculateInfluencerScore(input: ScoreInput): ScoreResult {
  const considerationScore = calculateConsiderationScore(input.avgConsiderationComments);
  const engagementScore = calculateEngagementScore(input.avgLikes);
  const efficiencyScore = calculateEfficiencyScore(input.costPerLike);
  const reliabilityScore = input.onTimeRate ?? SCORE_THRESHOLDS.DEFAULT_RELIABILITY;

  const totalScore = Math.round(
    considerationScore * SCORE_WEIGHTS.consideration +
    engagementScore * SCORE_WEIGHTS.engagement +
    efficiencyScore * SCORE_WEIGHTS.efficiency +
    reliabilityScore * SCORE_WEIGHTS.reliability
  );

  const rank = determineRank(totalScore);

  return {
    considerationScore,
    engagementScore,
    efficiencyScore,
    reliabilityScore,
    totalScore,
    rank,
  };
}

/**
 * スコアからランクを判定
 */
export function determineRank(score: number): InfluencerRank {
  if (score >= RANK_THRESHOLDS.S) return 'S';
  if (score >= RANK_THRESHOLDS.A) return 'A';
  if (score >= RANK_THRESHOLDS.B) return 'B';
  return 'C';
}

/**
 * キャンペーンデータからスコア計算に必要な統計を算出
 */
export function calculateStatsFromCampaigns(campaigns: {
  likes?: number | null;
  comments?: number | null;
  agreed_amount?: number | null;
  consideration_comment?: number | null;
  desired_post_date?: string | null;
  post_date?: string | null;
}[]): {
  totalLikes: number;
  totalComments: number;
  totalSpent: number;
  totalConsiderationComments: number;
  avgLikes: number;
  avgConsiderationComments: number;
  costPerLike: number;
  onTimeRate: number;
} {
  const totalCampaigns = campaigns.length;

  if (totalCampaigns === 0) {
    return {
      totalLikes: 0,
      totalComments: 0,
      totalSpent: 0,
      totalConsiderationComments: 0,
      avgLikes: 0,
      avgConsiderationComments: 0,
      costPerLike: 0,
      onTimeRate: 100,
    };
  }

  const totalLikes = campaigns.reduce((sum, c) => sum + (c.likes || 0), 0);
  const totalComments = campaigns.reduce((sum, c) => sum + (c.comments || 0), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + (c.agreed_amount || 0), 0);
  const totalConsiderationComments = campaigns.reduce((sum, c) => sum + (c.consideration_comment || 0), 0);

  // 納期遵守率を計算
  const campaignsWithDeadline = campaigns.filter(c => c.desired_post_date && c.post_date);
  const onTimeCampaigns = campaignsWithDeadline.filter(c => {
    const desired = new Date(c.desired_post_date!);
    const actual = new Date(c.post_date!);
    return actual <= desired;
  });
  const onTimeRate = campaignsWithDeadline.length > 0
    ? (onTimeCampaigns.length / campaignsWithDeadline.length) * 100
    : 100;

  return {
    totalLikes,
    totalComments,
    totalSpent,
    totalConsiderationComments,
    avgLikes: totalLikes / totalCampaigns,
    avgConsiderationComments: totalConsiderationComments / totalCampaigns,
    costPerLike: totalLikes > 0 ? totalSpent / totalLikes : 0,
    onTimeRate,
  };
}
