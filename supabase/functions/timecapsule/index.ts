import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_EMAIL = Deno.env.get('VAPID_EMAIL')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async () => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 감사 메시지가 5개 미만이면 비활성화
    const { count } = await supabase
      .from('gratitude')
      .select('*', { count: 'exact', head: true });

    if (!count || count < 5) {
      return new Response(JSON.stringify({ message: 'Not enough messages' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 30일~180일 전 메시지 중 랜덤 1개
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString();

    const { data: messages } = await supabase
      .from('gratitude')
      .select('*')
      .gte('created_at', sixMonthsAgo)
      .lte('created_at', thirtyDaysAgo);

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ message: 'No eligible messages' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const fromName = randomMessage.from_user === 'yubin' ? '유빈' : '문성';

    // 수신자의 push subscription 가져오기
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_name', randomMessage.to_user);

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriptions' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 알림 페이로드
    const daysDiff = Math.floor(
      (now.getTime() - new Date(randomMessage.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    const timeLabel = daysDiff >= 30 ? `${Math.floor(daysDiff / 30)}개월` : `${daysDiff}일`;

    const payload = JSON.stringify({
      title: '💌 타임캡슐 도착!',
      body: `${timeLabel} 전, ${fromName}이(가) 이런 마음을 전했어요 🌸`,
      url: '/gratitude',
    });

    // Web Push 발송 (각 구독에 대해)
    for (const sub of subs) {
      try {
        // Note: 실제 web-push 라이브러리 사용이 필요합니다
        // Deno에서는 web_push 모듈을 import하여 사용
        const { default: webPush } = await import('https://esm.sh/web-push@3.6.6');
        webPush.setVapidDetails(
          `mailto:${VAPID_EMAIL}`,
          VAPID_PUBLIC_KEY,
          VAPID_PRIVATE_KEY
        );
        await webPush.sendNotification(sub.subscription, payload);
      } catch (err) {
        console.error('Push failed:', err);
      }
    }

    return new Response(JSON.stringify({ message: 'Sent', to: randomMessage.to_user }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
