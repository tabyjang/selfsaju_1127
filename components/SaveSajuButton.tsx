import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { saveSajuRecord } from '../utils/sajuStorage';
import type { SajuInfo } from '../types';

interface SaveSajuButtonProps {
  sajuData: SajuInfo;
  onSaveSuccess?: () => void;
  onLoginRequired?: () => void;
}

export const SaveSajuButton: React.FC<SaveSajuButtonProps> = ({
  sajuData,
  onSaveSuccess,
  onLoginRequired,
}) => {
  const { user, isSignedIn } = useUser();
  const [isSaving, setIsSaving] = useState(false);

  const performSave = useCallback(async () => {
    if (!isSignedIn || !user) return;

    // 입력 폼에서 입력한 이름 사용 (없으면 "이름 없음")
    const recordName = sajuData.name?.trim() || '이름 없음';

    setIsSaving(true);

    try {
      const result = await saveSajuRecord(user.id, recordName, sajuData);

      if (result.success) {
        alert('사주 정보가 저장되었습니다.');
        onSaveSuccess?.();
      } else {
        alert('⚠️ 최대 10명까지만 저장이 가능합니다.\n기존 사주를 삭제 후 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('저장 중 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  }, [isSignedIn, user, sajuData, onSaveSuccess]);

  // 로그인 후 자동 저장 처리
  useEffect(() => {
    const pendingSave = localStorage.getItem('pendingSajuSave');
    if (pendingSave && isSignedIn && user) {
      // 로그인 완료 후 자동으로 저장
      localStorage.removeItem('pendingSajuSave');
      performSave();
    }
  }, [isSignedIn, user, performSave]);

  const handleSave = async () => {
    if (!isSignedIn || !user) {
      // 로그인이 필요하면, localStorage에 저장 대기 중 플래그와 사주 데이터 저장
      localStorage.setItem('pendingSajuSave', 'true');
      localStorage.setItem('pendingSajuData', JSON.stringify(sajuData));
      onLoginRequired?.();
      return;
    }

    await performSave();
  };

  return (
    <button
      onClick={handleSave}
      disabled={isSaving}
      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSaving ? '💾 저장 중...' : '💾 사주 저장하기'}
    </button>
  );
};
