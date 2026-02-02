'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import {
  Bell,
  Mail,
  Calendar,
  Clock,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Gift,
  Users,
  TrendingUp,
  Settings,
  Slack,
  MessageSquare,
  Zap,
  BellRing,
  Info,
} from 'lucide-react';

interface NotificationSettings {
  email_enabled: boolean;
  email_digest: 'realtime' | 'daily' | 'weekly' | 'none';
  notify_new_campaign: boolean;
  notify_status_change: boolean;
  notify_post_reminder: boolean;
  notify_engagement_milestone: boolean;
  reminder_days_before: number;
  slack_webhook_url: string;
  slack_enabled: boolean;
}

interface UpcomingReminder {
  id: string;
  type: 'post' | 'followup';
  campaign: {
    influencer: string;
    brand: string;
    item: string;
  };
  dueDate: string;
  daysUntil: number;
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reminders, setReminders] = useState<UpcomingReminder[]>([]);

  const [settings, setSettings] = useState<NotificationSettings>({
    email_enabled: true,
    email_digest: 'daily',
    notify_new_campaign: true,
    notify_status_change: true,
    notify_post_reminder: true,
    notify_engagement_milestone: false,
    reminder_days_before: 3,
    slack_webhook_url: '',
    slack_enabled: false,
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);

    // 投稿予定のリマインダーを取得
    const today = new Date();
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('*, influencer:influencers(insta_name)')
      .eq('status', 'agree')
      .gte('desired_post_date', today.toISOString().split('T')[0])
      .order('desired_post_date', { ascending: true })
      .limit(10);

    if (campaigns) {
      const upcoming: UpcomingReminder[] = campaigns.map(c => {
        const dueDate = new Date(c.desired_post_date);
        const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: c.id,
          type: 'post',
          campaign: {
            influencer: c.influencer?.insta_name || '不明',
            brand: c.brand || '',
            item: c.item_code || '',
          },
          dueDate: c.desired_post_date,
          daysUntil,
        };
      });
      setReminders(upcoming);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // 設定を保存（将来的にはSupabaseのuser_settingsテーブルに保存）
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
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
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/30">
              <Bell className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">通知設定</h1>
              <p className="text-gray-500 mt-0.5">リマインダーと通知の設定</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : saved ? (
              <CheckCircle size={18} />
            ) : (
              <Save size={18} />
            )}
            {saved ? '保存しました' : '設定を保存'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 設定パネル */}
          <div className="lg:col-span-2 space-y-6">
            {/* メール通知設定 */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">メール通知</h3>
                  <p className="text-sm text-gray-500">メールでの通知設定</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">メール通知を有効にする</p>
                    <p className="text-sm text-gray-500">重要な更新をメールで受け取る</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.email_enabled}
                      onChange={(e) => setSettings({ ...settings, email_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                {settings.email_enabled && (
                  <>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="font-medium text-gray-900 mb-3">通知頻度</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { value: 'realtime', label: 'リアルタイム' },
                          { value: 'daily', label: '毎日' },
                          { value: 'weekly', label: '毎週' },
                          { value: 'none', label: 'なし' },
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => setSettings({ ...settings, email_digest: option.value as any })}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              settings.email_digest === option.value
                                ? 'bg-primary-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: 'notify_new_campaign', label: '新規案件の作成', icon: Gift },
                        { key: 'notify_status_change', label: 'ステータス変更', icon: TrendingUp },
                        { key: 'notify_post_reminder', label: '投稿リマインダー', icon: BellRing },
                        { key: 'notify_engagement_milestone', label: 'エンゲージメントマイルストーン', icon: Zap },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <item.icon size={18} className="text-gray-400" />
                            <span className="text-gray-700">{item.label}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(settings as any)[item.key]}
                              onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* リマインダー設定 */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="text-green-600" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">リマインダー設定</h3>
                  <p className="text-sm text-gray-500">投稿期限のリマインダー</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  期限の何日前に通知
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={settings.reminder_days_before}
                    onChange={(e) => setSettings({ ...settings, reminder_days_before: parseInt(e.target.value) || 3 })}
                    min={1}
                    max={30}
                    className="input-field w-24"
                  />
                  <span className="text-gray-600">日前</span>
                </div>
              </div>
            </div>

            {/* Slack連携 */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageSquare className="text-purple-600" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Slack連携</h3>
                  <p className="text-sm text-gray-500">Slackへの通知設定</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Slack通知を有効にする</p>
                    <p className="text-sm text-gray-500">Webhookを使用してSlackに通知</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.slack_enabled}
                      onChange={(e) => setSettings({ ...settings, slack_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                {settings.slack_enabled && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook URL
                    </label>
                    <input
                      type="url"
                      value={settings.slack_webhook_url}
                      onChange={(e) => setSettings({ ...settings, slack_webhook_url: e.target.value })}
                      placeholder="https://hooks.slack.com/services/..."
                      className="input-field"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Slack AppからIncoming Webhooksを設定してURLを取得してください
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* サイドパネル - 今後のリマインダー */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Calendar className="text-amber-600" size={20} />
                </div>
                <h3 className="font-bold text-gray-900">今後の予定</h3>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-gray-400" size={24} />
                </div>
              ) : reminders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar size={40} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">予定されている投稿はありません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reminders.map(reminder => (
                    <div
                      key={reminder.id}
                      className={`p-3 rounded-xl border ${
                        reminder.daysUntil <= 3
                          ? 'bg-red-50 border-red-200'
                          : reminder.daysUntil <= 7
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            @{reminder.campaign.influencer}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {reminder.campaign.brand} {reminder.campaign.item}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-medium ${
                            reminder.daysUntil <= 3 ? 'text-red-600' :
                            reminder.daysUntil <= 7 ? 'text-amber-600' :
                            'text-gray-600'
                          }`}>
                            {reminder.daysUntil === 0 ? '今日' :
                             reminder.daysUntil === 1 ? '明日' :
                             `${reminder.daysUntil}日後`}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(reminder.dueDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ヒント */}
            <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
              <div className="flex items-start gap-3">
                <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-medium text-blue-900">通知のヒント</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    投稿期限の3日前にリマインダーを設定すると、フォローアップの時間を確保できます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
