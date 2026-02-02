import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/claude';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.message) {
      return NextResponse.json(
        { error: 'メッセージが必要です' },
        { status: 400 }
      );
    }

    const response = await chatWithAI(body.message, body.context || {
      totalCampaigns: 0,
      totalSpent: 0,
      totalLikes: 0,
      topInfluencers: [],
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json(
      { error: 'AIチャット中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
