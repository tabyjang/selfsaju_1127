import { supabase, SajuRecord } from "./supabase";
import type { SajuInfo } from "../types";

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
      birth_hour:
        sajuInfo.birthDate.hour === -1 ? null : sajuInfo.birthDate.hour,
      birth_minute: sajuInfo.birthDate.minute,
      birth_region: sajuInfo.birthRegion,
      daewoon: sajuInfo.daewoon,
      daewoon_number: sajuInfo.daewoonNumber,
      saju_data: sajuInfo, // 전체 사주 정보를 JSONB로 저장
    };

    // Supabase에 INSERT
    const { data, error } = await supabase
      .from("saju_records")
      .insert([record])
      .select()
      .single();

    if (error) {
      console.error("사주 저장 실패:", error);
      throw new Error("⚠️ 최대 10명까지만 저장이 가능합니다.");
    }

    console.log("사주 저장 성공:", data);
    return { success: true, data };
  } catch (err) {
    console.error("사주 저장 에러:", err);
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
      .from("saju_records")
      .select("*")
      .eq("id", recordId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("사주 조회 에러:", err);
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
      .from("saju_records")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }); // 최신순 정렬

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error("사주 목록 조회 에러:", err);
    return { success: false, error: err, data: [] };
  }
}

/**
 * 사주 레코드 수정
 * @param recordId - 수정할 레코드 ID
 * @param recordName - 수정할 이름
 * @param sajuInfo - 수정할 사주 정보
 * @returns 수정된 레코드 또는 에러
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
      birth_hour:
        sajuInfo.birthDate.hour === -1 ? null : sajuInfo.birthDate.hour,
      birth_minute: sajuInfo.birthDate.minute,
      birth_region: sajuInfo.birthRegion,
      daewoon: sajuInfo.daewoon,
      daewoon_number: sajuInfo.daewoonNumber,
      saju_data: sajuInfo,
    };

    const { data, error } = await supabase
      .from("saju_records")
      .update(record)
      .eq("id", recordId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("사주 수정 에러:", err);
    return { success: false, error: err };
  }
}

/**
 * 사주 레코드 삭제
 * @param recordId - 삭제할 레코드 ID
 * @returns 성공 여부
 */
export async function deleteSajuRecord(recordId: string) {
  try {
    const { error } = await supabase
      .from("saju_records")
      .delete()
      .eq("id", recordId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("사주 삭제 에러:", err);
    return { success: false, error: err };
  }
}

/**
 * "내 사주" 저장/업데이트 (UPSERT)
 * - 사용자당 1개의 사주 레코드만 유지
 * - 기존 레코드가 있으면 UPDATE, 없으면 INSERT
 * - 입력된 이름으로 저장
 * @param userId - Clerk user ID
 * @param sajuInfo - 사주 정보 객체
 * @returns 저장/수정된 레코드 또는 에러
 */
export async function upsertMySaju(userId: string, sajuInfo: SajuInfo) {
  try {
    // 1. 기존 레코드가 있는지 확인 (user_id로만 검색, 가장 최근 것)
    const { data: existingRecords, error: fetchError } = await supabase
      .from("saju_records")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    const record = {
      user_id: userId,
      record_name: sajuInfo.name || "이름 없음",
      gender: sajuInfo.gender,
      birth_year: sajuInfo.birthDate.year,
      birth_month: sajuInfo.birthDate.month,
      birth_day: sajuInfo.birthDate.day,
      birth_hour:
        sajuInfo.birthDate.hour === -1 ? null : sajuInfo.birthDate.hour,
      birth_minute: sajuInfo.birthDate.minute,
      birth_region: sajuInfo.birthRegion,
      daewoon: sajuInfo.daewoon,
      daewoon_number: sajuInfo.daewoonNumber,
      saju_data: sajuInfo,
    };

    // 2. 기존 레코드가 있으면 UPDATE
    if (existingRecords && existingRecords.length > 0) {
      const existingId = existingRecords[0].id;
      console.log(`기존 사주 발견 - 업데이트 중... (${sajuInfo.name})`, existingId);

      const { data, error } = await supabase
        .from("saju_records")
        .update(record)
        .eq("id", existingId)
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ ${sajuInfo.name}님의 사주 업데이트 완료!`);
      return { success: true, data, isUpdate: true };
    }

    // 3. 기존 레코드가 없으면 INSERT
    console.log(`새로운 사주 저장 중... (${sajuInfo.name})`);
    const { data, error } = await supabase
      .from("saju_records")
      .insert([record])
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ ${sajuInfo.name}님의 사주 저장 완료!`);
    return { success: true, data, isUpdate: false };
  } catch (err) {
    console.error("사주 저장/업데이트 에러:", err);
    return { success: false, error: err };
  }
}
