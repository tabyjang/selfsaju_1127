-- ========================================
-- RLS 정책 완전 초기화 및 재설정
-- ========================================
-- Supabase Dashboard -> SQL Editor에서 실행

-- 1. 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Users can view their own saju records" ON saju_records;
DROP POLICY IF EXISTS "Users can insert their own saju records" ON saju_records;
DROP POLICY IF EXISTS "Users can update their own saju records" ON saju_records;
DROP POLICY IF EXISTS "Users can delete their own saju records" ON saju_records;
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON payments;

-- 2. RLS 비활성화
ALTER TABLE saju_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- 3. 다시 RLS 활성화
ALTER TABLE saju_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 4. 새로운 정책 생성 (모든 인증된 사용자 허용)
CREATE POLICY "Enable all access for authenticated users"
  ON saju_records
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users on payments"
  ON payments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('saju_records', 'payments');
