-- ========================================
-- 사주 저장 시스템 데이터베이스 설정
-- ========================================
-- 이 SQL을 Supabase Dashboard의 SQL Editor에서 실행하세요.
-- https://app.supabase.com -> 프로젝트 선택 -> SQL Editor -> New query

-- ========================================
-- 1. 사주 기록 테이블 생성
-- ========================================
CREATE TABLE IF NOT EXISTS saju_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  record_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  birth_year INTEGER NOT NULL,
  birth_month INTEGER NOT NULL CHECK (birth_month BETWEEN 1 AND 12),
  birth_day INTEGER NOT NULL CHECK (birth_day BETWEEN 1 AND 31),
  birth_hour INTEGER CHECK (birth_hour BETWEEN 0 AND 23),
  birth_minute INTEGER CHECK (birth_minute BETWEEN 0 AND 59),
  birth_region TEXT NOT NULL,
  daewoon TEXT NOT NULL CHECK (daewoon IN ('sunhaeng', 'yeokhaeng')),
  daewoon_number INTEGER NOT NULL,
  saju_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 테이블 설명 추가
COMMENT ON TABLE saju_records IS '사용자가 저장한 사주 기록';
COMMENT ON COLUMN saju_records.user_id IS 'Clerk에서 발급한 사용자 ID';
COMMENT ON COLUMN saju_records.record_name IS '사주 레코드 이름 (예: 나, 아들, 엄마)';
COMMENT ON COLUMN saju_records.saju_data IS '전체 사주 정보를 JSON 형태로 저장';

-- ========================================
-- 2. 인덱스 생성 (검색 성능 향상)
-- ========================================
CREATE INDEX IF NOT EXISTS idx_saju_records_user_id ON saju_records(user_id);
CREATE INDEX IF NOT EXISTS idx_saju_records_created_at ON saju_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saju_records_user_created ON saju_records(user_id, created_at DESC);

-- ========================================
-- 3. updated_at 자동 업데이트 트리거
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_saju_records_updated_at ON saju_records;
CREATE TRIGGER update_saju_records_updated_at
  BEFORE UPDATE ON saju_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 4. 결제 정보 테이블 생성 (나중에 사용)
-- ========================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'KRW',
  payment_method TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_gateway TEXT,
  transaction_id TEXT,
  payment_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 테이블 설명 추가
COMMENT ON TABLE payments IS '사용자 결제 정보';
COMMENT ON COLUMN payments.user_id IS 'Clerk에서 발급한 사용자 ID';
COMMENT ON COLUMN payments.amount IS '결제 금액';
COMMENT ON COLUMN payments.status IS '결제 상태: pending(대기), completed(완료), failed(실패), refunded(환불)';

-- 결제 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user_created ON payments(user_id, created_at DESC);

-- ========================================
-- 5. Row Level Security (RLS) 설정
-- ========================================
-- RLS 활성화
ALTER TABLE saju_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Users can view their own saju records" ON saju_records;
DROP POLICY IF EXISTS "Users can insert their own saju records" ON saju_records;
DROP POLICY IF EXISTS "Users can update their own saju records" ON saju_records;
DROP POLICY IF EXISTS "Users can delete their own saju records" ON saju_records;
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON payments;

-- 정책 생성: 모든 사용자가 읽기/쓰기 가능 (클라이언트에서 user_id로 필터링)
-- 참고: Clerk를 사용하므로 서버사이드 인증이 아닌 클라이언트 필터링 방식
CREATE POLICY "Users can view their own saju records"
  ON saju_records
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own saju records"
  ON saju_records
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own saju records"
  ON saju_records
  FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own saju records"
  ON saju_records
  FOR DELETE
  USING (true);

CREATE POLICY "Users can view their own payments"
  ON payments
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own payments"
  ON payments
  FOR INSERT
  WITH CHECK (true);

-- ========================================
-- 6. 테스트 데이터 확인 쿼리 (실행하지 마세요!)
-- ========================================
-- 아래 쿼리들은 테이블이 제대로 생성되었는지 확인용입니다.
-- 주석을 해제하고 실행해서 확인하세요.

-- SELECT * FROM saju_records LIMIT 10;
-- SELECT COUNT(*) FROM saju_records;
-- SELECT * FROM payments LIMIT 10;

-- ========================================
-- 완료!
-- ========================================
-- 모든 테이블과 설정이 완료되었습니다.
-- 이제 프론트엔드에서 저장/불러오기 기능을 사용할 수 있습니다.
