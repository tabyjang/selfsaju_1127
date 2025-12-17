import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getUserSajuRecords, deleteSajuRecord } from '../utils/sajuStorage';
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

  const handleDelete = async (recordId: string, recordName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지

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

  const formatDate = (record: SajuRecord) => {
    const hasTime = record.birth_hour !== null && record.birth_minute !== null;
    return hasTime
      ? `${record.birth_year}.${String(record.birth_month).padStart(2, '0')}.${String(record.birth_day).padStart(2, '0')} ${String(record.birth_hour).padStart(2, '0')}:${String(record.birth_minute).padStart(2, '0')}`
      : `${record.birth_year}.${String(record.birth_month).padStart(2, '0')}.${String(record.birth_day).padStart(2, '0')} (시간 모름)`;
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                저장된 사주 목록
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
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
                <p className="text-gray-500 text-sm mt-2">
                  사주 결과 화면에서 "사주 저장하기" 버튼을 눌러 저장하세요.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => handleSelect(record)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800">
                          {record.record_name}
                        </h4>
                        <p className="text-gray-600 text-sm mt-1">
                          {formatDate(record)}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {record.gender === 'male' ? '남성' : '여성'} • {record.birth_region}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right text-xs text-gray-400">
                          {new Date(record.created_at).toLocaleDateString('ko-KR')}
                        </div>
                        <button
                          onClick={(e) => handleDelete(record.id, record.record_name, e)}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          삭제
                        </button>
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
