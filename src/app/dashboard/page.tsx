'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import {
  Users,
  Gift,
  Heart,
  MessageCircle,
  Loader2,
  DollarSign,
  Trophy,
  TrendingUp,
  Filter,
  Award,
  Package,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

interface Stats {
  totalCampaigns: number;
  totalInfluencers: number;
  totalSpent: number;
  totalLikes: number;
  totalComments: number;
  statusBreakdown: { name: string; value: number; color: string }[];
  brandStats: { brand: string; count: number; amount: number; likes: number }[];
  monthlyStats: { month: string; campaigns: number; amount: number; likes: number }[];
  influencerRanking: {
    insta_name: string;
    total_likes: number;
    total_comments: number;
    total_campaigns: number;
    total_amount: number;
    cost_per_like: number;
  }[];
  itemStats: {
    item_code: string;
    count: number;
    likes: number;
    comments: number;
    amount: number;
  }[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, selectedBrand, selectedItem, dateRange]);

  const fetchStats = async () => {
    setLoading(true);

    let query = supabase
      .from('campaigns')
      .select('*, influencer:influencers(*)');

    // フィルター適用
    if (selectedBrand !== 'all') {
      query = query.eq('brand', selectedBrand);
    }
    if (selectedItem !== 'all') {
      query = query.eq('item_code', selectedItem);
    }
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      switch (dateRange) {
        case '7d':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case '30d':
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case '90d':
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        case '1y':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(0);
      }
      query = query.gte('created_at', startDate.toISOString());
    }

    const { data: campaigns } = await query;
    const { data: influencers } = await supabase.from('influencers').select('*');
    const { data: allCampaigns } = await supabase.from('campaigns').select('brand, item_code');

    if (campaigns && influencers) {
      // ステータス別集計
      const statusCount = { pending: 0, agree: 0, disagree: 0, cancelled: 0 };
      campaigns.forEach((c) => {
        if (c.status in statusCount) {
          statusCount[c.status as keyof typeof statusCount]++;
        }
      });

      // ブランド別集計
      const brandMap = new Map<string, { count: number; amount: number; likes: number }>();
      campaigns.forEach((c) => {
        const brand = c.brand || '未設定';
        const existing = brandMap.get(brand) || { count: 0, amount: 0, likes: 0 };
        brandMap.set(brand, {
          count: existing.count + 1,
          amount: existing.amount + (c.agreed_amount || 0),
          likes: existing.likes + (c.likes || 0),
        });
      });

      // 月別集計
      const monthMap = new Map<string, { campaigns: number; amount: number; likes: number }>();
      campaigns.forEach((c) => {
        const date = c.post_date || c.created_at;
        if (date) {
          const month = date.substring(0, 7);
          const existing = monthMap.get(month) || { campaigns: 0, amount: 0, likes: 0 };
          monthMap.set(month, {
            campaigns: existing.campaigns + 1,
            amount: existing.amount + (c.agreed_amount || 0),
            likes: existing.likes + (c.likes || 0),
          });
        }
      });

      // インフルエンサー別集計（ランキング用）
      const influencerMap = new Map<string, {
        insta_name: string;
        total_likes: number;
        total_comments: number;
        total_campaigns: number;
        total_amount: number;
      }>();
      campaigns.forEach((c) => {
        if (c.influencer) {
          const key = c.influencer.id;
          const existing = influencerMap.get(key) || {
            insta_name: c.influencer.insta_name,
            total_likes: 0,
            total_comments: 0,
            total_campaigns: 0,
            total_amount: 0,
          };
          influencerMap.set(key, {
            insta_name: c.influencer.insta_name,
            total_likes: existing.total_likes + (c.likes || 0),
            total_comments: existing.total_comments + (c.comments || 0),
            total_campaigns: existing.total_campaigns + 1,
            total_amount: existing.total_amount + (c.agreed_amount || 0),
          });
        }
      });

      // 商品別集計
      const itemMap = new Map<string, { count: number; likes: number; comments: number; amount: number }>();
      campaigns.forEach((c) => {
        if (c.item_code) {
          const existing = itemMap.get(c.item_code) || { count: 0, likes: 0, comments: 0, amount: 0 };
          itemMap.set(c.item_code, {
            count: existing.count + 1,
            likes: existing.likes + (c.likes || 0),
            comments: existing.comments + (c.comments || 0),
            amount: existing.amount + (c.agreed_amount || 0),
          });
        }
      });

      setStats({
        totalCampaigns: campaigns.length,
        totalInfluencers: new Set(campaigns.map(c => c.influencer_id)).size,
        totalSpent: campaigns.reduce((sum, c) => sum + (c.agreed_amount || 0), 0),
        totalLikes: campaigns.reduce((sum, c) => sum + (c.likes || 0), 0),
        totalComments: campaigns.reduce((sum, c) => sum + (c.comments || 0), 0),
        statusBreakdown: [
          { name: '合意', value: statusCount.agree, color: '#22c55e' },
          { name: '保留', value: statusCount.pending, color: '#eab308' },
          { name: '不合意', value: statusCount.disagree, color: '#ef4444' },
          { name: 'キャンセル', value: statusCount.cancelled, color: '#6b7280' },
        ].filter((s) => s.value > 0),
        brandStats: Array.from(brandMap.entries())
          .map(([brand, data]) => ({ brand, ...data }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10),
        monthlyStats: Array.from(monthMap.entries())
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => a.month.localeCompare(b.month))
          .slice(-12),
        influencerRanking: Array.from(influencerMap.values())
          .map((inf) => ({
            ...inf,
            cost_per_like: inf.total_likes > 0 ? inf.total_amount / inf.total_likes : 0,
          }))
          .sort((a, b) => b.total_likes - a.total_likes)
          .slice(0, 10),
        itemStats: Array.from(itemMap.entries())
          .map(([item_code, data]) => ({ item_code, ...data }))
          .sort((a, b) => b.likes - a.likes)
          .slice(0, 10),
      });
    }

    setLoading(false);
  };

  // ユニークなブランドと商品リスト取得
  const [brands, setBrands] = useState<string[]>([]);
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const fetchFilters = async () => {
      const { data } = await supabase.from('campaigns').select('brand, item_code');
      if (data) {
        setBrands(Array.from(new Set(data.map(c => c.brand).filter(Boolean))) as string[]);
        setItems(Array.from(new Set(data.map(c => c.item_code).filter(Boolean))) as string[]);
      }
    };
    fetchFilters();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('ja-JP').format(value);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
            <p className="text-gray-500 mt-1">ギフティング活動のBI分析</p>
          </div>

          {/* フィルター */}
          <div className="flex flex-wrap gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">全期間</option>
              <option value="7d">過去7日</option>
              <option value="30d">過去30日</option>
              <option value="90d">過去90日</option>
              <option value="1y">過去1年</option>
            </select>

            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">全ブランド</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">全商品</option>
              {items.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KPIカード */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Gift className="text-primary-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">総案件数</p>
                <p className="text-2xl font-bold">{formatNumber(stats.totalCampaigns)}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">インフルエンサー</p>
                <p className="text-2xl font-bold">{formatNumber(stats.totalInfluencers)}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">総支出額</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-100 rounded-lg">
                <Heart className="text-pink-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">総いいね</p>
                <p className="text-2xl font-bold">{formatNumber(stats.totalLikes)}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">いいね単価</p>
                <p className="text-2xl font-bold">
                  {stats.totalLikes > 0 ? formatCurrency(stats.totalSpent / stats.totalLikes) : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* インフルエンサーランキング */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="text-yellow-500" size={24} />
              <h3 className="font-bold text-gray-900">インフルエンサー成績ランキング</h3>
            </div>
            <div className="space-y-3">
              {stats.influencerRanking.map((inf, index) => (
                <div
                  key={inf.insta_name}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index === 0 ? 'bg-yellow-50 border border-yellow-200' :
                    index === 1 ? 'bg-gray-50 border border-gray-200' :
                    index === 2 ? 'bg-orange-50 border border-orange-200' :
                    'bg-white border border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                      index === 0 ? 'bg-yellow-400 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-400 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">@{inf.insta_name}</p>
                      <p className="text-xs text-gray-500">{inf.total_campaigns}件</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-pink-500">
                      <Heart size={14} />
                      <span className="font-bold">{formatNumber(inf.total_likes)}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      単価: {inf.cost_per_like > 0 ? formatCurrency(inf.cost_per_like) : '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 商品別パフォーマンス */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Package className="text-primary-500" size={24} />
              <h3 className="font-bold text-gray-900">商品別パフォーマンス</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.itemStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="item_code" width={80} />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === 'likes') return [formatNumber(value), 'いいね'];
                      if (name === 'comments') return [formatNumber(value), 'コメント'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="likes" fill="#ec4899" name="いいね" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="comments" fill="#3b82f6" name="コメント" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* チャート行 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ステータス別割合 */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">ステータス別割合</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {stats.statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ブランド別支出 */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">ブランド別パフォーマンス</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.brandStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="brand" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="amount" fill="#0ea5e9" name="支出額" />
                  <Bar yAxisId="right" dataKey="likes" fill="#ec4899" name="いいね" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 月別推移 */}
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">月別トレンド</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === '支出額') return formatCurrency(value);
                    return formatNumber(value);
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="campaigns"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.3}
                  name="案件数"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="likes"
                  stroke="#ec4899"
                  fill="#ec4899"
                  fillOpacity={0.3}
                  name="いいね"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* コスト効率分析 */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Award className="text-green-500" size={24} />
            <h3 className="font-bold text-gray-900">コスト効率分析</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-pink-50 rounded-xl">
              <p className="text-sm text-gray-500">いいね単価</p>
              <p className="text-3xl font-bold text-pink-600">
                {stats.totalLikes > 0 ? formatCurrency(stats.totalSpent / stats.totalLikes) : '-'}
              </p>
              <p className="text-xs text-gray-400">1いいねあたり</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-500">コメント単価</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalComments > 0 ? formatCurrency(stats.totalSpent / stats.totalComments) : '-'}
              </p>
              <p className="text-xs text-gray-400">1コメントあたり</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-gray-500">案件単価</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.totalCampaigns > 0 ? formatCurrency(stats.totalSpent / stats.totalCampaigns) : '-'}
              </p>
              <p className="text-xs text-gray-400">1案件あたり</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-gray-500">エンゲージメント率</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.totalLikes > 0
                  ? ((stats.totalComments / stats.totalLikes) * 100).toFixed(1) + '%'
                  : '-'}
              </p>
              <p className="text-xs text-gray-400">コメント/いいね</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
