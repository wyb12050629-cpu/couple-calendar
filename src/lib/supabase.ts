import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as ReturnType<typeof createClient>);

export type Event = {
  id: string;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  memo: string | null;
  owner: 'yubin' | 'munsung' | 'shared';
  image_url: string | null;
  created_at: string;
};

export type Gratitude = {
  id: string;
  from_user: 'yubin' | 'munsung';
  to_user: 'yubin' | 'munsung';
  message: string;
  created_at: string;
};

export type Owner = 'yubin' | 'munsung';
