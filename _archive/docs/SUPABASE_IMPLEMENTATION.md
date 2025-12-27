# Supabase 연동 및 사주 저장 기능 구현 가이드

## 목차
1. [개요](#개요)
2. [Supabase 설정](#1-supabase-설정)
3. [데이터베이스 테이블 설계](#2-데이터베이스-테이블-설계)
4. [프로젝트 설정](#3-프로젝트-설정)
5. [저장 기능 구현](#4-저장-기능-구현)
6. [불러오기 기능 구현](#5-불러오기-기능-구현)
7. [수정/삭제 기능](#6-수정삭제-기능)
8. [결제 기능 준비](#7-결제-기능-준비)
9. [보안 설정](#8-보안-설정)
10. [테스트 방법](#9-테스트-방법)

---

## 개요

### 구현할 기능
- 로그인한 유저의 사주 정보 저장
- 저장된 사주 목록 불러오기
- 저장된 사주 수정/삭제
- 나중에 결제 정보 저장 (DB 구조 미리 준비)

### 기술 스택
- **인증**: Clerk (이미 구현됨)
- **데이터베이스**: Supabase PostgreSQL
- **프론트엔드**: React + TypeScript

### 왜 Supabase를 사용하나요?
- PostgreSQL 기반 오픈소스 BaaS (Backend as a Service)
- 실시간 데이터베이스 기능
- Row Level Security로 보안 관리 쉬움
- 무료 플랜으로 시작 가능
- REST API 자동 생성

---

## 1. Supabase 설정

### 1-1. Supabase 프로젝트 생성

1. **Supabase 웹사이트 접속**
   - https://supabase.com 접속
   - "Start your project" 클릭
   - GitHub 계정으로 로그인

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - Organization 선택 (없으면 생성)
   - 프로젝트 정보 입력:
     ```
     Name: selfsaju (또는 원하는 이름)
     Database Password: 강력한 비밀번호 생성 (메모해두기!)
     Region: Northeast Asia (Seoul) - 한국 서버 선택
     Pricing Plan: Free (무료)
     ```
   - "Create new project" 클릭
   - 약 2-3분 대기 (데이터베이스 생성 중)

3. **프로젝트 정보 확인**
   - 프로젝트 생성 완료 후, 좌측 메뉴에서 "Settings" > "API" 클릭
   - 다음 정보를 메모장에 복사:
     ```
     Project URL: https://xxxxx.supabase.co
     anon/public key: eyJhbGc...
     ```

### 1-2. 환경변수 설정

프로젝트 루트에 `.env.local` 파일 생성 (또는 기존 파일에 추가):

```env
# Supabase 설정
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**주의**: `.env.local` 파일은 `.gitignore`에 포함시켜 Git에 커밋되지 않도록 해야 합니다.

---

## 2. 데이터베이스 테이블 설계

### 2-1. 테이블 구조 설계

#### `saju_records` 테이블 (사주 저장용)

| 컬럼명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| id | uuid | 고유 ID (자동 생성) | `123e4567-e89b-12d3-a456-426614174000` |
| user_id | text | Clerk의 유저 ID | `user_2xxx` |
| record_name | text | 저장된 사주 이름 | "나", "아들", "엄마" |
| gender | text | 성별 | "male" 또는 "female" |
| birth_year | integer | 출생 년도 | 1990 |
| birth_month | integer | 출생 월 | 5 |
| birth_day | integer | 출생 일 | 15 |
| birth_hour | integer | 출생 시 (null 가능) | 14 |
| birth_minute | integer | 출생 분 (null 가능) | 30 |
| birth_region | text | 출생 지역 | "서울" |
| daewoon | text | 대운 방향 | "sunhaeng" 또는 "yeokhaeng" |
| daewoon_number | integer | 대운수 | 5 |
| saju_data | jsonb | 전체 사주 정보 (pillars 등) | JSON 객체 |
| created_at | timestamptz | 생성 일시 | 자동 생성 |
| updated_at | timestamptz | 수정 일시 | 자동 업데이트 |

**왜 일부는 별도 컬럼으로 분리했나요?**
- 생년월일, 성별 등은 검색/필터링/정렬에 자주 사용
- JSONB는 유연하지만 쿼리가 복잡함
- 자주 사용하는 필드는 별도 컬럼으로 관리하면 성능 향상

#### `payments` 테이블 (결제 정보용, 나중에 사용)

| 컬럼명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| id | uuid | 고유 ID | 자동 생성 |
| user_id | text | Clerk의 유저 ID | `user_2xxx` |
| amount | integer | 결제 금액 | 10000 |
| currency | text | 통화 | "KRW" |
| payment_method | text | 결제 수단 | "card", "kakaopay" |
| status | text | 결제 상태 | "pending", "completed", "failed" |
| payment_gateway | text | 결제 대행사 | "tosspayments", "stripe" |
| transaction_id | text | 거래 ID | 결제 대행사 제공 ID |
| payment_data | jsonb | 결제 상세 정보 | JSON 객체 |
| created_at | timestamptz | 결제 일시 | 자동 생성 |

### 2-2. Supabase에서 테이블 생성

1. **Supabase Dashboard 접속**
   - 좌측 메뉴에서 "SQL Editor" 클릭

2. **SQL 실행**
   - "New query" 클릭
   - 아래 SQL 스크립트 복사 & 붙여넣기
   - "Run" 버튼 클릭

```sql
-- 사주 기록 테이블 생성
CREATE TABLE saju_records (
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

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX idx_saju_records_user_id ON saju_records(user_id);
CREATE INDEX idx_saju_records_created_at ON saju_records(created_at DESC);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_saju_records_updated_at
  BEFORE UPDATE ON saju_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 결제 정보 테이블 생성 (나중에 사용)
CREATE TABLE payments (
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

-- 결제 테이블 인덱스
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- 코멘트 추가 (테이블 설명)
COMMENT ON TABLE saju_records IS '사용자가 저장한 사주 기록';
COMMENT ON TABLE payments IS '사용자 결제 정보';
```

3. **테이블 생성 확인**
   - 좌측 메뉴에서 "Table Editor" 클릭
   - `saju_records`와 `payments` 테이블이 보이면 성공!

### 2-3. Row Level Security (RLS) 설정

**RLS란?**
- 데이터베이스 레벨에서 접근 권한 제어
- 각 사용자가 자신의 데이터만 볼 수 있도록 제한

**설정 방법:**

```sql
-- RLS 활성화
ALTER TABLE saju_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 정책 생성: 사용자는 자신의 데이터만 읽을 수 있음
CREATE POLICY "Users can view their own saju records"
  ON saju_records
  FOR SELECT
  USING (true);  -- 일단 모든 사용자가 읽을 수 있도록 (클라이언트에서 필터링)

-- 정책 생성: 사용자는 자신의 데이터만 삽입할 수 있음
CREATE POLICY "Users can insert their own saju records"
  ON saju_records
  FOR INSERT
  WITH CHECK (true);  -- 클라이언트에서 user_id 확인

-- 정책 생성: 사용자는 자신의 데이터만 업데이트할 수 있음
CREATE POLICY "Users can update their own saju records"
  ON saju_records
  FOR UPDATE
  USING (true);

-- 정책 생성: 사용자는 자신의 데이터만 삭제할 수 있음
CREATE POLICY "Users can delete their own saju records"
  ON saju_records
  FOR DELETE
  USING (true);

-- payments 테이블도 동일하게 설정
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT USING (true);

CREATE POLICY "Users can insert their own payments"
  ON payments FOR INSERT WITH CHECK (true);
```

**참고**: Clerk를 사용하므로 서버사이드 인증이 아닌 클라이언트에서 `user_id`로 필터링합니다. 더 강력한 보안이 필요하면 Supabase Auth와 연동하거나 서버리스 함수를 사용해야 합니다.

---

## 3. 프로젝트 설정

### 3-1. 필요한 패키지 설치

터미널에서 다음 명령어 실행:

```bash
npm install @supabase/supabase-js
```

**패키지 설명:**
- `@supabase/supabase-js`: Supabase JavaScript 클라이언트 라이브러리
- REST API 호출을 쉽게 만들어주는 헬퍼 함수 제공

### 3-2. Supabase 클라이언트 생성

`utils/supabase.ts` 파일 생성:

```typescript
import { createClient } from '@supabase/supabase-js';

// 환경변수에서 Supabase URL과 Key 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
  birth_hour?: number;
  birth_minute?: number;
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
  payment_method?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_gateway?: string;
  transaction_id?: string;
  payment_data?: any;
  created_at: string;
};
```

**설명:**
- `createClient`: Supabase 인스턴스 생성
- 환경변수를 통해 안전하게 설정값 관리
- TypeScript 타입 정의로 개발 중 자동완성 지원

---

## 4. 저장 기능 구현

### 4-1. 저장 함수 생성

`utils/sajuStorage.ts` 파일 생성:

```typescript
import { supabase, SajuRecord } from './supabase';
import type { SajuInfo } from '../types';

/**
 * 사주 정보를 Supabase에 저장
 * @param userId - Clerk에서 받은 user ID
 * @param recordName - 저장할 사주의 이름 (예: "나", "아들")
 * @param sajuInfo - 사주 정보 객체
 * @returns 저장된 레코드 또는 에러
 */
export async function saveSajuRecord(
  userId: string,
  recordName: string,
  sajuInfo: SajuInfo
) {
  try {
    // 데이터베이스에 저장할 형식으로 변환
    const record = {
      user_id: userId,
      record_name: recordName,
      gender: sajuInfo.gender,
      birth_year: sajuInfo.birthDate.year,
      birth_month: sajuInfo.birthDate.month,
      birth_day: sajuInfo.birthDate.day,
      birth_hour: sajuInfo.birthDate.hour === 'unknown' ? null : sajuInfo.birthDate.hour,
      birth_minute: sajuInfo.birthDate.minute,
      birth_region: sajuInfo.birthRegion,
      daewoon: sajuInfo.daewoon,
      daewoon_number: sajuInfo.daewoonNumber,
      saju_data: sajuInfo, // 전체 사주 정보를 JSONB로 저장
    };

    // Supabase에 INSERT
    const { data, error } = await supabase
      .from('saju_records')
      .insert([record])
      .select()
      .single();

    if (error) {
      console.error('사주 저장 실패:', error);
      throw new Error('사주 저장에 실패했습니다.');
    }

    console.log('사주 저장 성공:', data);
    return { success: true, data };
  } catch (err) {
    console.error('사주 저장 에러:', err);
    return { success: false, error: err };
  }
}

/**
 * 특정 사주 레코드 조회
 * @param recordId - 레코드 ID
 * @returns 사주 레코드
 */
export async function getSajuRecord(recordId: string) {
  try {
    const { data, error } = await supabase
      .from('saju_records')
      .select('*')
      .eq('id', recordId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('사주 조회 에러:', err);
    return { success: false, error: err };
  }
}

/**
 * 사용자의 모든 사주 레코드 조회
 * @param userId - Clerk user ID
 * @returns 사주 레코드 배열
 */
export async function getUserSajuRecords(userId: string) {
  try {
    const { data, error } = await supabase
      .from('saju_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }); // 최신순 정렬

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('사주 목록 조회 에러:', err);
    return { success: false, error: err, data: [] };
  }
}
```

### 4-2. 저장 UI 추가

`components/SaveSajuButton.tsx` 파일 생성:

```typescript
import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { saveSajuRecord } from '../utils/sajuStorage';
import type { SajuInfo } from '../types';

interface SaveSajuButtonProps {
  sajuData: SajuInfo;
  onSaveSuccess?: () => void;
}

export const SaveSajuButton: React.FC<SaveSajuButtonProps> = ({
  sajuData,
  onSaveSuccess,
}) => {
  const { user, isSignedIn } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [recordName, setRecordName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!isSignedIn || !user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!recordName.trim()) {
      alert('저장할 이름을 입력해주세요.');
      return;
    }

    setIsSaving(true);

    try {
      const result = await saveSajuRecord(user.id, recordName.trim(), sajuData);

      if (result.success) {
        alert('사주 정보가 저장되었습니다.');
        setShowModal(false);
        setRecordName('');
        onSaveSuccess?.();
      } else {
        alert('저장에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('저장 중 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const quickSaveOptions = ['나', '배우자', '아들', '딸', '엄마', '아빠'];

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold shadow-md"
      >
        💾 사주 저장하기
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              사주 저장하기
            </h3>

            <p className="text-gray-600 mb-4">
              이 사주를 어떤 이름으로 저장하시겠어요?
            </p>

            <input
              type="text"
              value={recordName}
              onChange={(e) => setRecordName(e.target.value)}
              placeholder="예: 나, 아들, 친구"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              maxLength={20}
            />

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">빠른 선택:</p>
              <div className="flex flex-wrap gap-2">
                {quickSaveOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setRecordName(option)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50"
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
```

### 4-3. App.tsx에 저장 버튼 추가

`AnalysisResult` 컴포넌트에 `SaveSajuButton` 추가:

```typescript
// AnalysisResult.tsx에서

import { SaveSajuButton } from './SaveSajuButton';

// ... 기존 코드 ...

// 결과 화면 상단에 저장 버튼 추가
<div className="flex justify-end mb-4">
  <SaveSajuButton sajuData={sajuData} />
</div>
```

---

## 5. 불러오기 기능 구현

### 5-1. 저장된 목록 컴포넌트 생성

`components/SavedSajuList.tsx` 파일 생성:

```typescript
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getUserSajuRecords } from '../utils/sajuStorage';
import type { SajuRecord } from '../utils/supabase';
import type { SajuInfo } from '../types';

interface SavedSajuListProps {
  onSelect: (sajuData: SajuInfo) => void;
}

export const SavedSajuList: React.FC<SavedSajuListProps> = ({ onSelect }) => {
  const { user, isSignedIn } = useUser();
  const [records, setRecords] = useState<SajuRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const loadRecords = async () => {
    if (!isSignedIn || !user) return;

    setIsLoading(true);
    try {
      const result = await getUserSajuRecords(user.id);
      if (result.success) {
        setRecords(result.data);
      }
    } catch (error) {
      console.error('목록 불러오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showModal && isSignedIn) {
      loadRecords();
    }
  }, [showModal, isSignedIn]);

  const handleSelect = (record: SajuRecord) => {
    // JSONB에서 저장된 전체 사주 정보 복원
    onSelect(record.saju_data as SajuInfo);
    setShowModal(false);
  };

  const formatDate = (record: SajuRecord) => {
    const hasTime = record.birth_hour !== null && record.birth_minute !== null;
    return hasTime
      ? `${record.birth_year}.${record.birth_month}.${record.birth_day} ${String(record.birth_hour).padStart(2, '0')}:${String(record.birth_minute).padStart(2, '0')}`
      : `${record.birth_year}.${record.birth_month}.${record.birth_day} (시간 모름)`;
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition font-semibold shadow-md"
      >
        📂 저장된 사주 보기
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                저장된 사주 목록
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">불러오는 중...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">저장된 사주가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => handleSelect(record)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg text-gray-800">
                          {record.record_name}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {formatDate(record)}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {record.gender === 'male' ? '남성' : '여성'} • {record.birth_region}
                        </p>
                      </div>
                      <div className="text-right text-xs text-gray-400">
                        {new Date(record.created_at).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
```

### 5-2. App.tsx에 불러오기 버튼 추가

```typescript
// App.tsx에서

import { SavedSajuList } from './components/SavedSajuList';

// ... 기존 코드 ...

// SajuInputForm 근처에 추가
<div className="flex justify-center gap-4 mb-8">
  <SavedSajuList
    onSelect={(sajuData) => {
      setSajuDataForDisplay(sajuData);
      setShowLanding(false);
    }}
  />
</div>
```

---

## 6. 수정/삭제 기능

### 6-1. 수정/삭제 함수 추가

`utils/sajuStorage.ts`에 추가:

```typescript
/**
 * 사주 레코드 수정
 */
export async function updateSajuRecord(
  recordId: string,
  recordName: string,
  sajuInfo: SajuInfo
) {
  try {
    const record = {
      record_name: recordName,
      gender: sajuInfo.gender,
      birth_year: sajuInfo.birthDate.year,
      birth_month: sajuInfo.birthDate.month,
      birth_day: sajuInfo.birthDate.day,
      birth_hour: sajuInfo.birthDate.hour === 'unknown' ? null : sajuInfo.birthDate.hour,
      birth_minute: sajuInfo.birthDate.minute,
      birth_region: sajuInfo.birthRegion,
      daewoon: sajuInfo.daewoon,
      daewoon_number: sajuInfo.daewoonNumber,
      saju_data: sajuInfo,
    };

    const { data, error } = await supabase
      .from('saju_records')
      .update(record)
      .eq('id', recordId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('사주 수정 에러:', err);
    return { success: false, error: err };
  }
}

/**
 * 사주 레코드 삭제
 */
export async function deleteSajuRecord(recordId: string) {
  try {
    const { error } = await supabase
      .from('saju_records')
      .delete()
      .eq('id', recordId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('사주 삭제 에러:', err);
    return { success: false, error: err };
  }
}
```

### 6-2. SavedSajuList에 삭제 버튼 추가

```typescript
// SavedSajuList.tsx에서

import { deleteSajuRecord } from '../utils/sajuStorage';

// ... 기존 코드 ...

const handleDelete = async (recordId: string, recordName: string) => {
  if (!confirm(`"${recordName}"을(를) 삭제하시겠습니까?`)) {
    return;
  }

  try {
    const result = await deleteSajuRecord(recordId);
    if (result.success) {
      alert('삭제되었습니다.');
      loadRecords(); // 목록 새로고침
    } else {
      alert('삭제에 실패했습니다.');
    }
  } catch (error) {
    console.error('삭제 중 오류:', error);
    alert('삭제 중 오류가 발생했습니다.');
  }
};

// 각 레코드에 삭제 버튼 추가
<button
  onClick={(e) => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지
    handleDelete(record.id, record.record_name);
  }}
  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded text-sm"
>
  삭제
</button>
```

---

## 7. 결제 기능 준비

### 7-1. 결제 시스템 선택

**국내 결제 대행사:**
1. **토스페이먼츠** (추천)
   - 국내 1위 결제 시스템
   - 간편한 API
   - 다양한 결제 수단 (카드, 계좌이체, 간편결제)
   - https://docs.tosspayments.com/

2. **포트원 (구 아임포트)**
   - 여러 PG사 통합
   - 무료 시작 가능

**해외 결제:**
- **Stripe**: 글로벌 결제, 정기 결제 지원

### 7-2. 결제 플로우

```
1. 사용자가 결제 버튼 클릭
   ↓
2. 프론트엔드에서 결제 요청 (토스페이먼츠 SDK)
   ↓
3. 사용자가 결제 진행
   ↓
4. 결제 승인 (Webhook 또는 리다이렉트)
   ↓
5. Supabase payments 테이블에 저장
   ↓
6. 사용자에게 크레딧/서비스 제공
```

### 7-3. 결제 저장 함수 (예시)

`utils/paymentStorage.ts` 파일 생성:

```typescript
import { supabase } from './supabase';

export async function savePayment(
  userId: string,
  amount: number,
  paymentMethod: string,
  transactionId: string,
  paymentData: any
) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([
        {
          user_id: userId,
          amount,
          currency: 'KRW',
          payment_method: paymentMethod,
          status: 'completed',
          payment_gateway: 'tosspayments',
          transaction_id: transactionId,
          payment_data: paymentData,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('결제 저장 에러:', err);
    return { success: false, error: err };
  }
}

export async function getUserPayments(userId: string) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('결제 내역 조회 에러:', err);
    return { success: false, error: err, data: [] };
  }
}
```

---

## 8. 보안 설정

### 8-1. 환경변수 보안

**절대 공개하면 안 되는 것:**
- Database Password
- Service Role Key (Supabase)
- 결제 Secret Key

**공개해도 되는 것:**
- Supabase URL
- Supabase Anon Key (RLS로 보호됨)

### 8-2. .gitignore 확인

```gitignore
# 환경변수
.env
.env.local
.env.production
.env.development

# Supabase 로컬 설정
supabase/.temp
```

### 8-3. 프로덕션 환경변수 설정

**Vercel/Netlify 배포 시:**
1. Dashboard에서 Environment Variables 설정
2. `VITE_SUPABASE_URL` 추가
3. `VITE_SUPABASE_ANON_KEY` 추가

### 8-4. API Rate Limiting

Supabase는 기본적으로 Rate Limiting이 설정되어 있습니다:
- 무료 플랜: 초당 100 요청
- Pro 플랜: 초당 500 요청

---

## 9. 테스트 방법

### 9-1. 로컬 테스트

1. **개발 서버 실행**
   ```bash
   npm run dev
   ```

2. **저장 기능 테스트**
   - 로그인
   - 사주 입력
   - "사주 저장하기" 클릭
   - 이름 입력 후 저장
   - Supabase Dashboard > Table Editor에서 데이터 확인

3. **불러오기 기능 테스트**
   - "저장된 사주 보기" 클릭
   - 목록에서 항목 선택
   - 사주 결과가 다시 표시되는지 확인

4. **삭제 기능 테스트**
   - 목록에서 삭제 버튼 클릭
   - 삭제 후 목록에서 사라지는지 확인

### 9-2. 에러 처리 테스트

1. **네트워크 오류 시뮬레이션**
   - 개발자 도구 > Network > Offline
   - 저장 시도 → 에러 메시지 확인

2. **로그아웃 상태에서 저장 시도**
   - 로그인 유도 메시지 확인

3. **중복 저장**
   - 같은 이름으로 여러 번 저장
   - 모두 저장되는지 확인 (또는 중복 방지 로직 추가)

### 9-3. Supabase Dashboard 확인

**데이터 확인:**
1. Table Editor > saju_records 클릭
2. 저장된 데이터가 올바른지 확인
3. JSONB 컬럼(saju_data) 클릭 → JSON 뷰어로 내용 확인

**쿼리 로그 확인:**
1. Logs > Database 클릭
2. 실행된 SQL 쿼리 확인
3. 에러 로그 확인

---

## 10. 다음 단계 (고급 기능)

### 추가 개선 사항

1. **검색 기능**
   - 이름으로 검색
   - 생년월일로 필터링

2. **정렬 옵션**
   - 최신순/오래된순
   - 이름순

3. **페이지네이션**
   - 한 페이지에 10개씩 표시
   - 더 보기 버튼

4. **공유 기능**
   - 특정 사주를 URL로 공유
   - 공개/비공개 설정

5. **즐겨찾기**
   - 자주 보는 사주를 즐겨찾기에 추가

6. **결제 후 크레딧 시스템**
   - 결제 시 크레딧 추가
   - AI 분석 시 크레딧 차감

---

## 문제 해결 (Troubleshooting)

### 자주 발생하는 에러

**1. "Failed to fetch" 에러**
- 원인: 네트워크 연결 문제 또는 Supabase URL 오류
- 해결: `.env.local` 파일의 URL 확인

**2. "Row Level Security" 에러**
- 원인: RLS 정책이 너무 엄격
- 해결: SQL Editor에서 정책 확인 및 수정

**3. "Invalid API key" 에러**
- 원인: Anon Key가 잘못됨
- 해결: Supabase Dashboard에서 키 재확인

**4. "Cannot insert null value" 에러**
- 원인: 필수 컬럼에 null 값
- 해결: 데이터 전송 전에 필수 필드 확인

**5. CORS 에러**
- 원인: Supabase 프로젝트 설정 문제
- 해결: Supabase Dashboard > Authentication > URL Configuration에서 Site URL 추가

---

## 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Clerk 공식 문서](https://clerk.com/docs)
- [토스페이먼츠 API 문서](https://docs.tosspayments.com/)
- [React TypeScript 가이드](https://react-typescript-cheatsheet.netlify.app/)

---

## 체크리스트

구현 전에 확인하세요:

- [ ] Supabase 프로젝트 생성 완료
- [ ] 환경변수 설정 완료 (.env.local)
- [ ] 테이블 생성 완료 (saju_records, payments)
- [ ] RLS 정책 설정 완료
- [ ] @supabase/supabase-js 설치 완료
- [ ] Supabase 클라이언트 파일 생성 (utils/supabase.ts)
- [ ] 저장 함수 구현 완료 (utils/sajuStorage.ts)
- [ ] 저장 UI 구현 완료 (SaveSajuButton.tsx)
- [ ] 불러오기 UI 구현 완료 (SavedSajuList.tsx)
- [ ] 로컬 테스트 완료
- [ ] 프로덕션 환경변수 설정 완료

---

## 작성자 메모

이 문서는 단계별로 따라하면서 구현할 수 있도록 작성되었습니다. 각 단계를 진행하면서 문제가 발생하면:

1. 에러 메시지를 자세히 읽어보기
2. Supabase Dashboard에서 로그 확인하기
3. 브라우저 개발자 도구의 Console과 Network 탭 확인하기
4. 이 문서의 "문제 해결" 섹션 참고하기

천천히 한 단계씩 진행하면 반드시 성공할 수 있습니다!
