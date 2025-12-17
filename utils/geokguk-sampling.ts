/**
 * 격국(외격/내격) 발생 비율을 대략적으로 점검하기 위한 샘플링 스크립트입니다.
 *
 * 주의:
 * - 이 샘플은 실제 출생일시로부터 계산된 "현실 사주" 분포가 아니라,
 *   천간/지지를 무작위로 조합해 만든 가상 표본입니다.
 * - 목적은 로직이 외격을 "너무 자주" 반환하지 않는지에 대한 감(比率)을 보는 것입니다.
 *
 * 실행 예:
 * node --loader ts-node/esm --experimental-specifier-resolution=node -e "import('./utils/geokguk-sampling.ts').then(m=>m.runSampling())"
 */

import { analyzeGeokguk } from "./gyeokguk.ts";
import { getSajuInfoFromCharacters } from "./manse.ts";

const heavenlyStems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const earthlyBranches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

function randInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}

function pick<T>(arr: readonly T[]): T {
  return arr[randInt(arr.length)];
}

function makeRandomCharacters() {
  // characters 배열은 [시간, 시지, 일간, 일지, 월간, 월지, 년간, 년지] 순서
  const siGan = pick(heavenlyStems);
  const siJi = pick(earthlyBranches);
  const ilGan = pick(heavenlyStems);
  const ilJi = pick(earthlyBranches);
  const wolGan = pick(heavenlyStems);
  const wolJi = pick(earthlyBranches);
  const nyeonGan = pick(heavenlyStems);
  const nyeonJi = pick(earthlyBranches);
  return [siGan, siJi, ilGan, ilJi, wolGan, wolJi, nyeonGan, nyeonJi];
}

export async function runSampling(sampleCount = 20000) {
  const byCategory: Record<string, number> = Object.create(null);
  const byMethod: Record<string, number> = Object.create(null);

  let external = 0;
  let internal = 0;
  let unknown = 0;

  for (let i = 0; i < sampleCount; i++) {
    const characters = makeRandomCharacters();
    const sajuInfo = getSajuInfoFromCharacters(
      characters,
      "male",
      "sunhaeng",
      1,
      { year: 2000, month: 1, day: 1, hour: 0, minute: 0 },
      "서울 부근"
    );

    const result = analyzeGeokguk(sajuInfo, false);
    if (!result.판단가능 || !result.격국) {
      unknown++;
      continue;
    }

    if (result.격국.격분류 === "외격") external++;
    else internal++;

    byCategory[result.격국.격분류] = (byCategory[result.격국.격분류] || 0) + 1;
    const method = result.격국.판단근거?.방법 || "unknown_method";
    byMethod[method] = (byMethod[method] || 0) + 1;
  }

  const total = external + internal + unknown;
  const pct = (n: number) => ((n / total) * 100).toFixed(2);

  console.log("\n=== 격국 샘플링 결과(가상 표본) ===");
  console.log(`표본: ${total.toLocaleString()}개`);
  console.log(`외격: ${external.toLocaleString()}개 (${pct(external)}%)`);
  console.log(`내격: ${internal.toLocaleString()}개 (${pct(internal)}%)`);
  console.log(`판단불가: ${unknown.toLocaleString()}개 (${pct(unknown)}%)`);

  const topMethods = Object.entries(byMethod).sort((a, b) => b[1] - a[1]).slice(0, 12);
  console.log("\n[판단근거.방법] 상위 분포:");
  for (const [k, v] of topMethods) {
    console.log(`- ${k}: ${v.toLocaleString()} (${pct(v) }%)`);
  }
}


