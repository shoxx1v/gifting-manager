'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Staff, StaffFormData } from '@/types';
import { Users, Plus, Edit2, Trash2, X, Loader2, TrendingUp, Target, DollarSign } from 'lucide-react';
import { useToast } from '@/lib/toast';

interface StaffStats {
  staff_id: string;
  total_campaigns: number;
  agreed_campaigns: number;
  total_likes: number;
  total_amount: number;
  agreement_rate: number;
  cost_per_like: number;
}

export default function StaffsPage() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [staffStats, setStaffStats] = useState<Map<string, StaffStats>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    email: '',
    department: '',
    position: '',
  });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // 社員一覧を取得
  const fetchStaffs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('staffs')
      .select('*')
      .order('name');

    if (error) {
      showToast('error', '社員の取得に失敗しました');
    } else {
      setStaffs(data || []);
      // 統計も取得
      await fetchStaffStats(data || []);
    }
    setLoading(false);
  };

  // 社員別の成績統計を取得
  const fetchStaffStats = async (staffList: Staff[]) => {
    const statsMap = new Map<string, StaffStats>();

    for (const staff of staffList) {
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('status, likes, agreed_amount')
        .eq('staff_id', staff.id);

      if (campaigns) {
        const total = campaigns.length;
        const agreed = campaigns.filter(c => c.status === 'agree').length;
        const totalLikes = campaigns.reduce((sum, c) => sum + (c.likes || 0), 0);
        const totalAmount = campaigns.reduce((sum, c) => sum + (c.agreed_amount || 0), 0);

        statsMap.set(staff.id, {
          staff_id: staff.id,
          total_campaigns: total,
          agreed_campaigns: agreed,
          total_likes: totalLikes,
          total_amount: totalAmount,
          agreement_rate: total > 0 ? (agreed / total) * 100 : 0,
          cost_per_like: totalLikes > 0 ? totalAmount / totalLikes : 0,
        });
      }
    }

    setStaffStats(statsMap);
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  // 保存処理
  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast('error', '名前を入力してください');
      return;
    }

    setSaving(true);
    try {
      if (editingStaff) {
        const { error } = await supabase
          .from('staffs')
          .update({
            name: formData.name,
            email: formData.email || null,
            department: formData.department || null,
            position: formData.position || null,
          })
          .eq('id', editingStaff.id);

        if (error) throw error;
        showToast('success', '社員情報を更新しました');
      } else {
        const { error } = await supabase
          .from('staffs')
          .insert([{
            name: formData.name,
            email: formData.email || null,
            department: formData.department || null,
            position: formData.position || null,
          }]);

        if (error) throw error;
        showToast('success', '社員を登録しました');
      }

      setShowModal(false);
      setEditingStaff(null);
      setFormData({ name: '', email: '', department: '', position: '' });
      fetchStaffs();
    } catch (err: any) {
      showToast('error', err.message || 'エラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  // 削除処理（非アクティブ化）
  const handleDelete = async (staff: Staff) => {
    if (!confirm(`${staff.name}さんを非アクティブにしますか？`)) return;

    const { error } = await supabase
      .from('staffs')
      .update({ is_active: false })
      .eq('id', staff.id);

    if (error) {
      showToast('error', '削除に失敗しました');
    } else {
      showToast('success', '社員を非アクティブにしました');
      fetchStaffs();
    }
  };

  // 編集モーダルを開く
  const openEditModal = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email || '',
      department: staff.department || '',
      position: staff.position || '',
    });
    setShowModal(true);
  };

  // 新規追加モーダルを開く
  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({ name: '', email: '', department: '', position: '' });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="text-gray-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">社員管理</h1>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={18} />
          社員を追加
        </button>
      </div>

      {/* 社員一覧 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">名前</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">部署</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">役職</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-600">案件数</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-600">合意率</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-600">いいね単価</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staffs.filter(s => s.is_active).map((staff) => {
              const stats = staffStats.get(staff.id);
              return (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{staff.name}</div>
                      {staff.email && (
                        <div className="text-sm text-gray-500">{staff.email}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{staff.department || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{staff.position || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Target size={14} className="text-gray-400" />
                      <span className="font-medium">{stats?.total_campaigns || 0}</span>
                      {stats && stats.agreed_campaigns > 0 && (
                        <span className="text-gray-400 text-sm">
                          ({stats.agreed_campaigns}件合意)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp size={14} className="text-gray-400" />
                      <span className={`font-medium ${
                        (stats?.agreement_rate || 0) >= 50 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {stats?.agreement_rate.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <DollarSign size={14} className="text-gray-400" />
                      <span className="font-medium">
                        ¥{stats?.cost_per_like.toFixed(0) || '0'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(staff)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(staff)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {staffs.filter(s => s.is_active).length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  社員が登録されていません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingStaff ? '社員を編集' : '社員を追加'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                  placeholder="山田 太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                  placeholder="yamada@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  部署
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                  placeholder="マーケティング部"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  役職
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                  placeholder="マネージャー"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin mx-auto" size={20} />
                ) : (
                  editingStaff ? '更新' : '追加'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
