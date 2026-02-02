'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Campaign, Influencer } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2,
  Filter,
  Heart,
  MessageCircle,
  User,
  Calendar,
} from 'lucide-react';
import CampaignModal from '@/components/forms/CampaignModal';

export default function CampaignsPage() {
  const { user, loading: authLoading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);

    // インフルエンサーと案件を同時取得（作成者・更新者情報も含む）
    const [influencersRes, campaignsRes] = await Promise.all([
      supabase.from('influencers').select('*'),
      supabase
        .from('campaigns')
        .select(`
          *,
          influencer:influencers(*),
          creator:user_profiles!campaigns_created_by_fkey(id, display_name, email),
          updater:user_profiles!campaigns_updated_by_fkey(id, display_name, email)
        `)
        .order('created_at', { ascending: false }),
    ]);

    if (influencersRes.data) {
      setInfluencers(influencersRes.data);
    }
    if (campaignsRes.data) {
      setCampaigns(campaignsRes.data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この案件を削除しますか？')) {
      return;
    }

    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (!error) {
      setCampaigns(campaigns.filter((c) => c.id !== id));
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCampaign(null);
  };

  const handleSave = () => {
    fetchData();
    handleModalClose();
  };

  // ユニークなブランドリスト
  const brands = [...new Set(campaigns.map((c) => c.brand).filter(Boolean))];

  // フィルタリング
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.influencer?.insta_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.item_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesBrand = brandFilter === 'all' || c.brand === brandFilter;
    return matchesSearch && matchesStatus && matchesBrand;
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'agree':
        return 'status-agree';
      case 'disagree':
        return 'status-disagree';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'agree':
        return '合意';
      case 'disagree':
        return '不合意';
      case 'pending':
        return '保留';
      case 'cancelled':
        return 'キャンセル';
      default:
        return status;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ja-JP');
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ギフティング案件管理</h1>
            <p className="text-gray-500 mt-1">案件数: {campaigns.length}件</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            新規案件
          </button>
        </div>

        {/* フィルター */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="検索（インフルエンサー、品番、ブランド）..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field pl-9 pr-8 appearance-none cursor-pointer"
              >
                <option value="all">全ステータス</option>
                <option value="pending">保留</option>
                <option value="agree">合意</option>
                <option value="disagree">不合意</option>
                <option value="cancelled">キャンセル</option>
              </select>
            </div>

            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="input-field appearance-none cursor-pointer"
            >
              <option value="all">全ブランド</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* テーブル */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin" size={40} />
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm || statusFilter !== 'all' || brandFilter !== 'all'
                ? '検索結果がありません'
                : '案件が登録されていません'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="table-header px-4 py-3">ブランド</th>
                    <th className="table-header px-4 py-3">インフルエンサー</th>
                    <th className="table-header px-4 py-3">品番</th>
                    <th className="table-header px-4 py-3">提示額</th>
                    <th className="table-header px-4 py-3">合意額</th>
                    <th className="table-header px-4 py-3">ステータス</th>
                    <th className="table-header px-4 py-3">投稿日</th>
                    <th className="table-header px-4 py-3">エンゲージメント</th>
                    <th className="table-header px-4 py-3">投稿</th>
                    <th className="table-header px-4 py-3">更新者/日時</th>
                    <th className="table-header px-4 py-3">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="table-cell">{campaign.brand || '-'}</td>
                      <td className="table-cell font-medium">
                        @{campaign.influencer?.insta_name || '不明'}
                      </td>
                      <td className="table-cell">{campaign.item_code || '-'}</td>
                      <td className="table-cell">
                        {formatAmount(campaign.offered_amount)}
                      </td>
                      <td className="table-cell">
                        {formatAmount(campaign.agreed_amount)}
                      </td>
                      <td className="table-cell">
                        <span className={getStatusClass(campaign.status)}>
                          {getStatusLabel(campaign.status)}
                        </span>
                      </td>
                      <td className="table-cell text-gray-500">
                        {formatDate(campaign.post_date)}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-pink-500">
                            <Heart size={14} />
                            {campaign.likes?.toLocaleString() || 0}
                          </span>
                          <span className="flex items-center gap-1 text-blue-500">
                            <MessageCircle size={14} />
                            {campaign.comments?.toLocaleString() || 0}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell">
                        {campaign.post_url ? (
                          <a
                            href={campaign.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline flex items-center gap-1"
                          >
                            表示
                            <ExternalLink size={14} />
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <div className="text-xs">
                          {campaign.updater ? (
                            <div className="flex items-center gap-1 text-gray-600">
                              <User size={12} />
                              <span>{campaign.updater.display_name || campaign.updater.email?.split('@')[0]}</span>
                            </div>
                          ) : campaign.creator ? (
                            <div className="flex items-center gap-1 text-gray-600">
                              <User size={12} />
                              <span>{campaign.creator.display_name || campaign.creator.email?.split('@')[0]}</span>
                            </div>
                          ) : null}
                          <div className="flex items-center gap-1 text-gray-400 mt-1">
                            <Calendar size={12} />
                            <span>{new Date(campaign.updated_at).toLocaleDateString('ja-JP')}</span>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(campaign)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(campaign.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <CampaignModal
          campaign={editingCampaign}
          influencers={influencers}
          onClose={handleModalClose}
          onSave={handleSave}
        />
      )}
    </MainLayout>
  );
}
