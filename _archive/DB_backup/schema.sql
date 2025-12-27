-- =========================================================
-- [사주 저장 10명 제한 시스템] 최종 설정 (Trigger 방식)
-- =========================================================
-- 이 SQL은 RLS(정책)의 한계를 극복하고, '트리거'를 사용해
-- 물리적으로 데이터가 10개를 넘지 못하도록 강제하는 코드입니다.
-- =========================================================


-- 1. [초기화] 기존에 꼬여있을 수 있는 모든 권한 설정을 깨끗하게 삭제합니다.
-- (이전에 만들었던 '10개 제한 정책'이나 '내 것만 보기 정책' 등이 충돌하지 않게 정리)
DROP POLICY IF EXISTS "Users can insert up to 10 saju records" ON saju_records;
DROP POLICY IF EXISTS "Limit 10 records per user" ON saju_records;
DROP POLICY IF EXISTS "Enable read access" ON saju_records;
DROP POLICY IF EXISTS "Enable update access" ON saju_records;
DROP POLICY IF EXISTS "Enable delete access" ON saju_records;
DROP POLICY IF EXISTS "Allow All Access" ON saju_records;


-- 2. [기본 권한 부여] 일단 앱이 정상 작동하도록 길을 뚫어줍니다.
-- 읽기(SELECT), 수정(UPDATE), 삭제(DELETE), 입력(INSERT)을 모두 허용합니다.
-- (단, '입력'은 아래에서 만들 트리거가 최종 문지기 역할을 하게 됩니다.)
CREATE POLICY "Allow All Access" 
ON saju_records 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- DB의 보안 기능(RLS)을 켭니다. (이게 꺼져 있으면 위 정책이 작동 안 함)
ALTER TABLE saju_records ENABLE ROW LEVEL SECURITY;


-- 3. [핵심 기능] 개수를 세고 차단하는 '경찰관(함수)' 만들기
-- 데이터가 들어올 때마다 실행될 함수입니다.
CREATE OR REPLACE FUNCTION check_saju_limit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- [로직 설명]
  -- 새로 저장하려는 데이터(NEW)의 user_id와 똑같은 아이디를 가진 데이터가
  -- 현재 테이블에 몇 개나 있는지(COUNT) 셉니다.
  -- 만약 그 개수가 10개 이상이라면? (>= 10)
  IF (SELECT COUNT(*) FROM saju_records WHERE user_id = NEW.user_id) >= 10 THEN
    
    -- [강제 차단]
    -- 에러를 발생시켜 저장을 취소시킵니다.
    -- 'LIMIT_REACHED'라는 문구는 나중에 프론트엔드에서 알아채기 위한 암호입니다.
    RAISE EXCEPTION 'LIMIT_REACHED: 최대 10명까지만 저장 가능합니다.';
  END IF;

  -- 10개 미만이라면 통과(RETURN NEW) 시켜서 저장을 허락합니다.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 4. [적용] 위에서 만든 경찰관을 문 앞에 배치하기 (트리거 연결)
-- saju_records 테이블에 데이터가 입력되기 직전(BEFORE INSERT)에
-- 위 함수를 무조건 실행하도록 설정합니다.
DROP TRIGGER IF EXISTS tr_check_saju_limit ON saju_records;

CREATE TRIGGER tr_check_saju_limit
BEFORE INSERT ON saju_records
FOR EACH ROW
EXECUTE FUNCTION check_saju_limit_trigger();


