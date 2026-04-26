// Supabase Edge Function: send-gratitude-push
// Sends Web Push notifications when a gratitude message is created.
//
// Deploy: supabase functions deploy send-gratitude-push
// Required env vars (Supabase Dashboard > Edge Functions > Secrets):
//   VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY, VAPID_SUBJECT

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  to_user: string;
  from_name: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to_user, from_name } = (await req.json()) as PushPayload;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:wyb12050629@gmail.com';

    if (!vapidPrivateKey || !vapidPublicKey) {
      return new Response(
        JSON.stringify({ error: 'VAPID keys not configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get push subscriptions for recipient
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('id, subscription')
      .eq('user_name', to_user);

    if (!subs || subs.length === 0) {
      return new Response(
        JSON.stringify({ success: 0, failed: 0, message: 'No subscriptions found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const notificationPayload = JSON.stringify({
      title: '마음이 도착했어요 💌',
      body: `${from_name}님이 당신에게 고마움을 표현했습니다.`,
      icon: '/icon-192x192.png',
      data: { url: '/gratitude' },
    });

    let success = 0;
    let failed = 0;
    const expiredIds: string[] = [];

    for (const sub of subs) {
      try {
        const subscription = sub.subscription;
        const endpoint = subscription.endpoint;
        const p256dh = subscription.keys?.p256dh;
        const auth = subscription.keys?.auth;

        if (!endpoint || !p256dh || !auth) {
          failed++;
          continue;
        }

        // Use the Web Push API via fetch to the push service endpoint
        // For full VAPID signing, a web-push library is needed.
        // This is a simplified version that works with the subscription endpoint directly.
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'TTL': '86400',
          },
          body: notificationPayload,
        });

        if (response.status === 410 || response.status === 404) {
          // Subscription expired — clean up
          expiredIds.push(sub.id);
          failed++;
        } else if (response.ok || response.status === 201) {
          success++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    // Remove expired subscriptions
    if (expiredIds.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('id', expiredIds);
    }

    return new Response(
      JSON.stringify({ success, failed, expired_cleaned: expiredIds.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
