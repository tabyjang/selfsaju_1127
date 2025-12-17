import { createClient } from '@supabase/supabase-js';

// 환경변수에서 Supabase URL과 Key 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL과 Anon Key가 환경변수에 설정되지 않았습니다.');
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 타입 정의 (TypeScript 지원)
export type SajuRecord = {
  id: string;
  user_id: string;
  record_name: string;
  gender: 'male' | 'female';
  birth_year: number;
  birth_month: number;
  birth_day: number;
  birth_hour?: number | null;
  birth_minute?: number | null;
  birth_region: string;
  daewoon: 'sunhaeng' | 'yeokhaeng';
  daewoon_number: number;
  saju_data: any; // SajuInfo 타입
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method?: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_gateway?: string | null;
  transaction_id?: string | null;
  payment_data?: any;
  created_at: string;
};
