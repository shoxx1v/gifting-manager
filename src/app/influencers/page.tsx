'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Influencer } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Instagram,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import InfluencerModal from '@/components/forms/InfluencerModal';

export default function InfluencersPage() {
  const { user, loading: authLoading } = useAuth();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null);

  useEffect(() => {
    if (user) {
      fetchInfluencers();
    }
  }, [user]);

  const fetchInfluencers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('influencers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setInfluencers(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このインフルエンサーを削除しますか？関連する案件も全て削除されます。')) {
      return;
    }

    const { error } = await supabase.from('influencers').delete().eq('id', id);
    if (!error) {
      setInfluencers(influencers.filter((i) => i.id !== id));
    }
  };

  const handleEdit = (influencer: Influencer) => {
    setEditingInfluencer(influencer);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingInfluencer(null);
  };

  const handleSave = () => {
    fetchInfluencers();
    handleModalClose();
  };

  const filteredInfluencers = influencers.filter((i) =>
    i.insta_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-2xl font-bold text-gray-900">インフルエンサー管理</h1>
            <p className="text-gray-500 mt-1">登録済み: {influencers.length}名</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            新規追加
          </button>
        </div>

        {/* 検索 */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="インフルエンサーを検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* テーブル */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin" size={40} />
            </div>
          ) : filteredInfluencers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm
                ? '検索結果がありません'
                : 'インフルエンサーが登録されていません'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="table-header px-6 py-3">Instagram名</th>
                    <th className="table-header px-6 py-3">Instagram URL</th>
                    <th className="table-header px-6 py-3">TikTok URL</th>
                    <th className="table-header px-6 py-3">登録日</th>
                    <th className="table-header px-6 py-3">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInfluencers.map((influencer) => (
                    <tr key={influencer.id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">
                        <div className="flex items-center gap-2">
                          <Instagram size={16} className="text-pink-500" />
                          @{influencer.insta_name}
                        </div>
                      </td>
                      <td className="table-cell">
                        {influencer.insta_url ? (
                          <a
                            href={influencer.insta_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline flex items-center gap-1"
                          >
                            リンク
                            <ExternalLink size={14} />
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="table-cell">
                        {influencer.tiktok_url ? (
                          <a
                            href={influencer.tiktok_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline flex items-center gap-1"
                          >
                            リンク
                            <ExternalLink size={14} />
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="table-cell text-gray-500">
                        {new Date(influencer.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(influencer)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(influencer.id)}
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
        <InfluencerModal
          influencer={editingInfluencer}
          onClose={handleModalClose}
          onSave={handleSave}
        />
      )}
    </MainLayout>
  );
}
