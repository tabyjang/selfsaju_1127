import type { IljuBundle } from "./types";

// ganji(간지) -> DB 파일명 매핑 (일단 갑자만 연결, 이후 60개로 확장)
const iljuFileMap: Record<string, string> = {
  // 甲
  甲子: "DB-ILJU-001_gapja.json",
  甲寅: "DB-ILJU-002_gapin.json",
  甲辰: "DB-ILJU-003_gapjin.json",
  甲午: "DB-ILJU-004_gabo.json",
  甲申: "DB-ILJU-005_gapsin.json",
  甲戌: "DB-ILJU-006_gapsul.json",

  // 乙
  乙丑: "DB-ILJU-007_eulchuk.json",
  乙卯: "DB-ILJU-008_eulmyo.json",
  乙巳: "DB-ILJU-009_eulsa.json",
  乙未: "DB-ILJU-010_eulmi.json",
  乙酉: "DB-ILJU-011_eulyu.json",
  乙亥: "DB-ILJU-012_eulhae.json",

  // 丙
  丙子: "DB-ILJU-013_byeongja.json",
  丙寅: "DB-ILJU-014_byeongin.json",
  丙辰: "DB-ILJU-015_byeongjin.json",
  丙午: "DB-ILJU-016_byeongo.json",
  丙申: "DB-ILJU-017_byeongsin.json",
  丙戌: "DB-ILJU-018_byeongsul.json",

  // 丁
  丁丑: "DB-ILJU-019_jeongchuk.json",
  丁卯: "DB-ILJU-020_jeongmyo.json",
  丁巳: "DB-ILJU-021_jeongsa.json",
  丁未: "DB-ILJU-022_jeongmi.json",
  丁酉: "DB-ILJU-023_jeongyu.json",
  丁亥: "DB-ILJU-024_jeonghae.json",

  // 戊
  戊子: "DB-ILJU-025_muja.json",
  戊寅: "DB-ILJU-026_muin.json",
  戊辰: "DB-ILJU-027_mujin.json",
  戊午: "DB-ILJU-028_muo.json",
  戊申: "DB-ILJU-029_musin.json",
  戊戌: "DB-ILJU-030_musul.json",

  // 己
  己丑: "DB-ILJU-031_gichuk.json",
  己卯: "DB-ILJU-032_gimyo.json",
  己巳: "DB-ILJU-033_gisa.json",
  己未: "DB-ILJU-034_gimi.json",
  己酉: "DB-ILJU-035_giyu.json",
  己亥: "DB-ILJU-036_gihae.json",

  // 庚
  庚子: "DB-ILJU-037_gyeongja.json",
  庚寅: "DB-ILJU-038_gyeongin.json",
  庚辰: "DB-ILJU-039_gyeongjin.json",
  庚午: "DB-ILJU-040_gyeongo.json",
  庚申: "DB-ILJU-041_gyeongsin.json",
  庚戌: "DB-ILJU-042_gyeongsul.json",

  // 辛
  辛丑: "DB-ILJU-043_sinchuk.json",
  辛卯: "DB-ILJU-044_sinmyo.json",
  辛巳: "DB-ILJU-045_sinsa.json",
  辛未: "DB-ILJU-046_sinmi.json",
  辛酉: "DB-ILJU-047_sinyu.json",
  辛亥: "DB-ILJU-048_sinhae.json",

  // 壬
  壬子: "DB-ILJU-049_imja.json",
  壬寅: "DB-ILJU-050_imin.json",
  壬辰: "DB-ILJU-051_imjin.json",
  壬午: "DB-ILJU-052_imo.json",
  壬申: "DB-ILJU-053_imsin.json",
  壬戌: "DB-ILJU-054_imsul.json",

  // 癸
  癸丑: "DB-ILJU-055_gyechuk.json",
  癸卯: "DB-ILJU-056_gyemyo.json",
  癸巳: "DB-ILJU-057_gyesa.json",
  癸未: "DB-ILJU-058_gyemi.json",
  癸酉: "DB-ILJU-059_gyeyu.json",
  癸亥: "DB-ILJU-060_gyehae.json",
};

export async function loadIljuBundle(
  ganji: string
): Promise<IljuBundle | null> {
  const filename = iljuFileMap[ganji];
  if (!filename) return null;

  // Vite: new URL(..., import.meta.url)로 JSON을 asset URL로 해석 가능
  const url = new URL(`../DB_ilju_60/${filename}`, import.meta.url);

  // 개발 모드: 캐시 비활성화 (수정 시 즉시 반영)
  // 프로덕션: 브라우저 캐시 활용 (성능 최적화)
  const fetchOptions: RequestInit = import.meta.env.DEV
    ? { cache: "no-store" }
    : { cache: "default" }; // 브라우저 기본 캐시 전략 사용

  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    throw new Error(`일주 DB 로드 실패: ${ganji} (${res.status})`);
  }
  const data: unknown = await res.json();

  // 통합 스키마(IljuBundle) 최소 요건 검증:
  // - general / ilji가 없으면 아직 준비되지 않은 것으로 간주
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  if (!obj.general || !obj.ilji) return null;

  return data as IljuBundle;
}
