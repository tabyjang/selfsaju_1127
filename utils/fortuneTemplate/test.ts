/**
 * 템플릿 기반 운세 생성 테스트
 */

import type { FortuneInput } from './types';
import { generateFortune, formatFortune } from './fortuneGenerator';
import { calculateMentalEnergy } from './templateSelector';

// 테스트용 mock fetch (Node.js 환경용)
if (typeof global !== 'undefined' && !global.fetch) {
  console.log('⚠️  Node.js 환경에서는 fetch가 없습니다. 브라우저에서 테스트하세요.');
}

/**
 * 테스트 1: 기축일주 × 장생 운성 (득령)
 */
async function test1() {
  console.log('\n=== 테스트 1: 기축일주 × 장생 운성 ===\n');

  const input: FortuneInput = {
    ilju: '己丑',
    todayJiji: '寅',
    sibsin: '비견',
    unseong: '장생',
    deukryeong: true,
    gwiin: false,
    date: new Date('2025-01-15'),
  };

  try {
    const fortune = await generateFortune(input);

    console.log('📊 운세 데이터:');
    console.log('  - ME:', fortune.mentalEnergy);
    console.log('  - 에너지 레벨:', fortune.energyLevel);
    console.log('  - 제목:', fortune.title);
    console.log('  - 액션플랜 개수:', fortune.actionPlans.length);

    console.log('\n📝 생성된 운세:\n');
    console.log(formatFortune(fortune));

    return true;
  } catch (error) {
    console.error('❌ 테스트 1 실패:', error);
    return false;
  }
}

/**
 * 테스트 2: 계묘일주 × 목욕 운성 (실령)
 */
async function test2() {
  console.log('\n=== 테스트 2: 계묘일주 × 목욕 운성 ===\n');

  const input: FortuneInput = {
    ilju: '癸卯',
    todayJiji: '酉',
    sibsin: '식신',
    unseong: '목욕',
    deukryeong: false,
    gwiin: false,
    date: new Date('2025-01-16'),
  };

  try {
    const fortune = await generateFortune(input);

    console.log('📊 운세 데이터:');
    console.log('  - ME:', fortune.mentalEnergy);
    console.log('  - 에너지 레벨:', fortune.energyLevel);
    console.log('  - 제목:', fortune.title);

    console.log('\n📝 생성된 운세:\n');
    console.log(formatFortune(fortune));

    return true;
  } catch (error) {
    console.error('❌ 테스트 2 실패:', error);
    return false;
  }
}

/**
 * 테스트 3: 병인일주 × 제왕 운성 (득령, 귀인)
 */
async function test3() {
  console.log('\n=== 테스트 3: 병인일주 × 제왕 운성 (귀인) ===\n');

  const input: FortuneInput = {
    ilju: '丙寅',
    todayJiji: '午',
    sibsin: '겁재',
    unseong: '제왕',
    deukryeong: true,
    gwiin: true,  // 귀인 있음
    date: new Date('2025-01-17'),
  };

  try {
    const fortune = await generateFortune(input);

    console.log('📊 운세 데이터:');
    console.log('  - ME:', fortune.mentalEnergy);
    console.log('  - 에너지 레벨:', fortune.energyLevel);
    console.log('  - 제목:', fortune.title);
    console.log('  - 귀인 메시지 포함 여부:', fortune.content.includes('귀인') || fortune.content.includes('도움'));

    console.log('\n📝 생성된 운세:\n');
    console.log(formatFortune(fortune));

    return true;
  } catch (error) {
    console.error('❌ 테스트 3 실패:', error);
    return false;
  }
}

/**
 * 테스트 4: 공휴일 (신정)
 */
async function test4() {
  console.log('\n=== 테스트 4: 공휴일 (신정) ===\n');

  const input: FortuneInput = {
    ilju: '己丑',
    todayJiji: '子',
    sibsin: '비견',
    unseong: '태',
    deukryeong: true,
    gwiin: false,
    date: new Date('2025-01-01'),  // 신정
  };

  try {
    const fortune = await generateFortune(input);

    console.log('📊 운세 데이터:');
    console.log('  - 제목:', fortune.title);
    console.log('  - 공휴일 메시지:', fortune.title.includes('신정'));

    console.log('\n📝 생성된 운세:\n');
    console.log(formatFortune(fortune));

    return true;
  } catch (error) {
    console.error('❌ 테스트 4 실패:', error);
    return false;
  }
}

/**
 * 테스트 5: ME 계산 로직
 */
function test5() {
  console.log('\n=== 테스트 5: ME 계산 로직 ===\n');

  const testCases = [
    { ae: 4, deuk: true, gwiin: false, sibsin: '비견', expected: 5 },
    { ae: 7, deuk: true, gwiin: false, sibsin: '식신', expected: 8 }, // cap at 7
    { ae: 5, deuk: false, gwiin: true, sibsin: '겁재', expected: 6 },
    { ae: 1, deuk: false, gwiin: false, sibsin: '정재', expected: 1 },
    { ae: 7, deuk: true, gwiin: true, sibsin: '비견', expected: 9 }, // cap at 7
  ];

  let passed = 0;
  testCases.forEach((tc, idx) => {
    const result = calculateMentalEnergy(tc.ae, tc.deuk, tc.gwiin, tc.sibsin);
    const expected = Math.min(7, tc.expected); // 실제로는 7로 cap됨
    const success = result === expected;

    console.log(`  케이스 ${idx + 1}: AE=${tc.ae}, 득령=${tc.deuk}, 귀인=${tc.gwiin}, 십성=${tc.sibsin}`);
    console.log(`    → ME=${result} ${success ? '✅' : '❌ (기대: ' + expected + ')'}`);

    if (success) passed++;
  });

  console.log(`\n  결과: ${passed}/${testCases.length} 통과`);
  return passed === testCases.length;
}

/**
 * 테스트 6: 같은 날짜는 같은 템플릿
 */
async function test6() {
  console.log('\n=== 테스트 6: 같은 날짜 일관성 ===\n');

  const input: FortuneInput = {
    ilju: '己丑',
    todayJiji: '寅',
    sibsin: '비견',
    unseong: '장생',
    deukryeong: true,
    gwiin: false,
    date: new Date('2025-01-20'),
  };

  try {
    const fortune1 = await generateFortune(input);
    const fortune2 = await generateFortune(input);

    const same = fortune1.title === fortune2.title &&
                 fortune1.content === fortune2.content;

    console.log('  첫 번째 생성:', fortune1.title);
    console.log('  두 번째 생성:', fortune2.title);
    console.log('  일치 여부:', same ? '✅ 일치' : '❌ 불일치');

    return same;
  } catch (error) {
    console.error('❌ 테스트 6 실패:', error);
    return false;
  }
}

/**
 * 모든 테스트 실행
 */
async function runAllTests() {
  console.log('\n🧪 템플릿 기반 운세 생성 테스트 시작\n');
  console.log('='.repeat(60));

  const results = {
    test1: false,
    test2: false,
    test3: false,
    test4: false,
    test5: false,
    test6: false,
  };

  // 테스트 5는 동기 함수
  results.test5 = test5();

  // 나머지는 비동기 함수
  try {
    results.test1 = await test1();
    results.test2 = await test2();
    results.test3 = await test3();
    results.test4 = await test4();
    results.test6 = await test6();
  } catch (error) {
    console.error('\n❌ 테스트 실행 중 오류:', error);
  }

  // 결과 요약
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 테스트 결과 요약\n');

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([name, result]) => {
    console.log(`  ${name}: ${result ? '✅ 통과' : '❌ 실패'}`);
  });

  console.log(`\n  전체: ${passed}/${total} 통과`);

  if (passed === total) {
    console.log('\n🎉 모든 테스트 통과!');
  } else {
    console.log('\n⚠️  일부 테스트 실패');
  }
}

// 테스트 실행
if (typeof window !== 'undefined') {
  // 브라우저 환경
  console.log('🌐 브라우저 환경에서 테스트 실행');
  runAllTests();
} else {
  // Node.js 환경
  console.log('⚠️  이 테스트는 브라우저 환경에서 실행해야 합니다.');
  console.log('   브라우저 콘솔에서 다음 명령어를 실행하세요:');
  console.log('   import("./utils/fortuneTemplate/test.ts").then(m => m.runAllTests())');
}

export { runAllTests, test1, test2, test3, test4, test5, test6 };
